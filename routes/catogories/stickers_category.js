const express = require('express');
const router = express.Router();
var jwt = require('jsonwebtoken');
const s3 = require('../../s3');

const StickersCategory = require('../../models/catogories/stickers_category');
const middleware = require('../../middleware/auth_middleware');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fieldSize: 2 * 1024 * 1024 }
});

router.post("/add", middleware, upload.single('icon'), async function(req, res) {
    jwt.verify(req.token, process.env.secret, async (err,authData) => {

        try {
        if(err) {
            res.json({ status: false, message: err.message, statusCode: 403 });
        }else {
            if(authData.user[0].is_admin){
                var stickersCategory = await StickersCategory.find({name: req.body.name});
                if(stickersCategory.length > 0){
                    res.json({ status: false, message: "Already Exist", statusCode: 404});
                }else{
                    const params = {
                        Bucket: 'poster-assets',
                        Key: "category/stickers/" + req.body.name + ".png",
                        Body: req.file.buffer,
                        ContentType: 'image/png', 
                        ACL: 'public-read',
                    };
                        const data = await s3.upload(params).promise();
                        const newStickersCategory = new StickersCategory({
                          name: req.body.name,
                          icon: new URL(data.Location).pathname,
                        });
                        await newStickersCategory.save();
                        var addedStickersCategory = await StickersCategory.find({ _id: newStickersCategory._id }, { __v: 0 });
                        res.json({ status: true, message: 'Stickers Category Added Successfully', statusCode: 200, data: addedStickersCategory[0] });
                }
            }else{
                res.json({ status: false, message: "Only Admin Can Access", statusCode: 400 });
            }
        }
    } catch (error) {
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
      const stickersCategory = await StickersCategory.find({}, { __v: 0 })
        .skip(skip)
        .limit(limit);
      const totalCount = await StickersCategory.countDocuments();
  
      res.json({
        status: true, message: "Success", statusCode: 200, data: stickersCategory, length: stickersCategory.length, page: page, totalPages: Math.ceil(totalCount / limit)
      });
    } catch (error) {
      res.json({status: false, message: error.message, statusCode: 500});
    }
  });

router.get("/get/:id", async function(req, res) {
    try{
    var stickersCategory = await StickersCategory.find({ _id: req.params.id },{ __v:0 });
    if(stickersCategory.length > 0){
        res.json({ status: true, message: "Success", statusCode: 200 , data: stickersCategory[0] });
    }else{
        res.json({ status: false, message: "stickersCategory Not Available", statusCode: 404 });
    }} catch (error) {
        console.error(error);
        res.status(200).json({ status: false,statusCode: 500, message: error.message });
    }
});

router.patch("/update/:id", middleware, upload.single('icon'), function(req, res) {
    jwt.verify(req.token, process.env.secret, async (err,authData) => {
        try{
        if(err) {
            res.json({ status: false, message: err.message, statusCode: 403 });
        }else {
            if(authData.user[0].is_admin){
                const params = {
                    Bucket: 'poster-assets',
                    Key: "category/stickers/" + req.body.name + ".png",
                    Body: req.file.buffer,
                    ContentType: 'image/png', 
                    ACL: 'public-read',
                };
                
                    const data = await s3.upload(params).promise();
                    const updatedStickersCategory = await StickersCategory.findOneAndUpdate({_id: req.params.id},
                        {
                            name: req.body.name,
                            icon: new URL(data.Location).pathname,
                        },
                        { new: true }
                    );
                    var uu = await StickersCategory.find({_id: req.params.id},{ __v:0}).exec();
                    res.json({ status: true, message: "Stickers Category Updated Successfully", statusCode: 200, data: uu[0]});
                
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
                var stickersCategory = await StickersCategory.deleteOne({_id: req.params.id});
                if(stickersCategory.deletedCount === 1) {
                    res.json({ status: true, message: "Stickers Category deleted Successfully", statusCode: 200});
                }else{
                    res.json({ status: false, message: "Stickers Category Not Found", statusCode: 400});
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