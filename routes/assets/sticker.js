const express = require('express');
const router = express.Router();
var jwt = require('jsonwebtoken');
const s3 = require('../../s3');

const Sticker = require('../../models/assets/sticker');
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
                const total = await Sticker.countDocuments();
                if(total > 0){
                    const lastDocument = await Sticker.findOne({}, {}, { sort: { id: -1 } });
                    var newId = lastDocument.id;
                }else{
                    var newId = 0;
                }
                newId++;
                var sticker = await Sticker.find({id: newId});
                if(sticker.length > 0){
                    res.json({ status: false, message: "Already Exist", statusCode: 404});
                }else{
                    const params = {
                        Bucket: 'posters-assets',
                        Key: "assets/stickers/" + newId + ".png",
                        Body: req.file.buffer,
                        ContentType: 'image/png', 
                        ACL: 'public-read',
                    };
                    try {
                        const data = await s3.upload(params).promise();
                        const newSticker = new Sticker({
                          id: newId,
                          title: req.file.originalname.substring(0, req.file.originalname.lastIndexOf('.')),
                          category_id: req.body.category_id,
                          src: new URL(data.Location).pathname,
                        });
                        await newSticker.save();
                        var addedSticker = await Sticker.find({ _id: newSticker._id }, { _id:0, __v: 0 });
                        res.json({ status: true, message: 'Sticker Added Successfully', statusCode: 200, data: addedSticker[0] });
                    } catch (error) {
                        console.error(error);
                        res.status(500).json({ status: false,statusCode: 500, message: 'An error occurred during sticker upload.' });
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
      const sticker = await Sticker.find({}, { _id:0,__v: 0 })
        .skip(skip)
        .limit(limit);
      const totalCount = await Sticker.countDocuments();
  
      res.json({
        status: true, message: "Success", statusCode: 200, data: sticker, length: sticker.length, page: page, totalPages: Math.ceil(totalCount / limit)
      });
    } catch (error) {
      res.json({status: false, message: error.message, statusCode: 500});
    }
  });

router.get("/get/:id", async function(req, res) {
    try{
    var sticker = await Sticker.find({ id: req.params.id },{ _id:0, __v:0 });
    if(sticker.length > 0){
        res.json({ status: true, message: "Success", statusCode: 200 , data: sticker[0] });
    }else{
        res.json({ status: false, message: "sticker Not Available", statusCode: 404 });
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
                    Key: "assets/stickers/" + req.params.id + ".png",
                    Body: req.file.buffer,
                    ContentType: 'image/png', 
                    ACL: 'public-read',
                };
                
                try {
                    const data = await s3.upload(params).promise();
                    const updatedSticker = await Sticker.findOneAndUpdate({id: req.params.id},
                        {
                            category_id: req.body.category_id,
                            title: req.file.originalname.substring(0, req.file.originalname.lastIndexOf('.')),
                            src: new URL(data.Location).pathname,
                        },
                        { new: true }
                    );
                    var uu = await Sticker.find({id: req.params.id},{ _id:0,__v:0}).exec();
                    res.json({ status: true, message: "Sticker Updated Successfully", statusCode: 200, data: uu[0]});
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ status: false,statusCode: 500, message: 'An error occurred during sticker upload.' });
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
                var sticker = await Sticker.deleteOne({id: req.params.id});
                if(sticker.deletedCount === 1) {
                    res.json({ status: true, message: "Sticker deleted Successfully", statusCode: 200});
                }else{
                    res.json({ status: false, message: "Sticker Not Found", statusCode: 400});
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