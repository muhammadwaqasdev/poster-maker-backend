const express = require('express');
const router = express.Router();
var jwt = require('jsonwebtoken');
const s3 = require('../../s3');

const Shape = require('../../models/assets/shape');
const middleware = require('../../middleware/auth_middleware');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fieldSize: 2 * 1024 * 1024 }
});

router.post("/add", middleware, upload.single('image'), async function(req, res) {
    jwt.verify(req.token, process.env.secret, async (err,authData) => {
        try{
        if(err) {
            res.json({ status: false, message: err.message, statusCode: 403 });
        }else {
            if(authData.user[0].is_admin){
                const total = await Shape.countDocuments();
                if(total > 0){
                    const lastDocument = await Shape.findOne({}, {}, { sort: { id: -1 } });
                    var newId = lastDocument.id;
                }else{
                    var newId = 0;
                }
                newId++;
                var shape = await Shape.find({id: newId});
                if(shape.length > 0){
                    res.json({ status: false, message: "Already Exist", statusCode: 404});
                }else{
                    const params = {
                        Bucket: 'posters-assets',
                        Key: "assets/shapes/" + newId + ".png",
                        Body: req.file.buffer,
                        ContentType: 'image/png', 
                        ACL: 'public-read',
                    };
                    try {
                        const data = await s3.upload(params).promise();
                        const newShape = new Shape({
                          id: newId,
                          title: req.file.originalname.substring(0, req.file.originalname.lastIndexOf('.')),
                          category_id: req.body.category_id,
                          src: new URL(data.Location).pathname,
                        });
                        await newShape.save();
                        var addedShape = await Shape.find({ _id: newShape._id }, { _id:0, __v: 0 });
                        res.json({ status: true, message: 'Shape Added Successfully', statusCode: 200, data: addedShape[0] });
                    } catch (error) {
                        console.error(error);
                        res.status(500).json({ status: false,statusCode: 500, message: 'An error occurred during shape upload.' });
                    }
                }
            }else{
                res.json({ status: false, message: "Only Admin Can Access", statusCode: 400 });
            }
        }} catch (error) {
            console.error(error);
            res.status(200).json({ status: false,statusCode: 500, message: error.message });
        }
    });
});

router.get("/getAll", async function(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000;
  
    try {
      const skip = (page - 1) * limit;
      const shape = await Shape.find({}, { _id:0,__v: 0 })
        .skip(skip)
        .limit(limit);
      const totalCount = await Shape.countDocuments();
  
      res.json({
        status: true, message: "Success", statusCode: 200, data: shape, length: shape.length, page: page, totalPages: Math.ceil(totalCount / limit)
      });
    } catch (error) {
      res.json({status: false, message: error.message, statusCode: 500});
    }
  });

router.get("/get/:id", async function(req, res) {
    try{
    var shape = await Shape.find({ id: req.params.id },{ _id:0, __v:0 });
    if(shape.length > 0){
        res.json({ status: true, message: "Success", statusCode: 200 , data: shape[0] });
    }else{
        res.json({ status: false, message: "shape Not Available", statusCode: 404 });
    }} catch (error) {
        console.error(error);
        res.status(200).json({ status: false,statusCode: 500, message: error.message });
    }
});

router.patch("/update/:id", middleware, upload.single('image'), function(req, res) {
    jwt.verify(req.token, process.env.secret, async (err,authData) => {
        try{
        if(err) {
            res.json({ status: false, message: err.message, statusCode: 403 });
        }else {
            if(authData.user[0].is_admin){
                const params = {
                    Bucket: 'posters-assets',
                    Key: "assets/shapes/" + req.params.id + ".png",
                    Body: req.file.buffer,
                    ContentType: 'image/png', 
                    ACL: 'public-read',
                };
                
                try {
                    const data = await s3.upload(params).promise();
                    const updatedShape = await Shape.findOneAndUpdate({id: req.params.id},
                        {
                            category_id: req.body.category_id,
                            title: req.file.originalname.substring(0, req.file.originalname.lastIndexOf('.')),
                            src: new URL(data.Location).pathname,
                        },
                        { new: true }
                    );
                    var uu = await Shape.find({id: req.params.id},{ _id:0,__v:0}).exec();
                    res.json({ status: true, message: "Shape Updated Successfully", statusCode: 200, data: uu[0]});
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ status: false,statusCode: 500, message: 'An error occurred during shape upload.' });
                }
            }else{
                res.json({ status: false, message: "Only Admin Can Access", statusCode: 400 });
            }
        }} catch (error) {
            console.error(error);
            res.status(200).json({ status: false,statusCode: 500, message: error.message });
        }
    });
});

router.post("/delete/:id", middleware, function(req, res) {
    jwt.verify(req.token, process.env.secret, async (err,authData) => {
        try{
        if(err) {
            res.json({ message: err.message, statusCode: 403 });
        }else {
            if(authData.user[0].is_admin){
                var shape = await Shape.deleteOne({id: req.params.id});
                if(shape.deletedCount === 1) {
                    res.json({ status: true, message: "Shape deleted Successfully", statusCode: 200});
                }else{
                    res.json({ status: false, message: "Shape Not Found", statusCode: 400});
                }
            }else{
                res.json({ status: false, message: "Only Admin Can Access", statusCode: 400 });
            }
        }} catch (error) {
            console.error(error);
            res.status(200).json({ status: false,statusCode: 500, message: error.message });
        }
    });
});

module.exports = router;