const express = require('express');
const router = express.Router();
var jwt = require('jsonwebtoken');
const s3 = require('../../s3');

const BackgroundCategory = require('../../models/catogories/backgrounds_category');
const middleware = require('../../middleware/auth_middleware');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/add", middleware, upload.single('icon'), async function(req, res) {
    jwt.verify(req.token, process.env.secret, async (err,authData) => {
        try{
        if(err) {
            res.json({ status: false, message: err.message, statusCode: 403 });
        }else {
            if(authData.user[0].is_admin){
                var backgroundCategory = await BackgroundCategory.find({name: req.body.name});
                if(backgroundCategory.length > 0){
                    res.json({ status: false, message: "Already Exist", statusCode: 404});
                }else{
                    const params = {
                        Bucket: 'posters-assets',
                        Key: "category/background/" + req.body.name + ".png",
                        Body: req.file.buffer,
                        ContentType: 'image/png', 
                        ACL: 'public-read',
                    };
                    
                    try {
                        const data = await s3.upload(params).promise();
                        const newBackgroundCategory = new BackgroundCategory({
                          name: req.body.name,
                          icon: new URL(data.Location).pathname,
                        });
                        await newBackgroundCategory.save();
                        var addedBackgroundCategory = await BackgroundCategory.find({ _id: newBackgroundCategory._id }, { __v: 0 });
                        res.json({ status: true, message: 'Background Category Added Successfully', statusCode: 200, data: addedBackgroundCategory[0] });
                    } catch (error) {
                        console.error(error);
                        res.status(500).json({ status: 500, message: 'An error occurred during background upload.' });
                    }
                }
            }else{
                res.json({ status: false, message: "Only Admin Can Access", statusCode: 400 });
            }
        }} catch (error) {
            console.error(error);
            res.status(200).json({ status: 500, message: error.message });
        }
    });
});

router.get("/getAll", async function(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000;
  
    try {
      const skip = (page - 1) * limit;
      const backgroundCategory = await BackgroundCategory.find({}, { __v: 0 })
        .skip(skip)
        .limit(limit);
      const totalCount = await BackgroundCategory.countDocuments();
  
      res.json({
        status: true, message: "Success", statusCode: 200, data: backgroundCategory, length: backgroundCategory.length, page: page, totalPages: Math.ceil(totalCount / limit)
      });
    } catch (error) {
      res.json({status: false, message: error.message, statusCode: 500});
    }
  });

router.get("/get/:id", async function(req, res) {
    try{
    var backgroundCategory = await BackgroundCategory.find({ _id: req.params.id },{ __v:0 });
    if(backgroundCategory.length > 0){
        res.json({ status: true, message: "Success", statusCode: "200" , data: backgroundCategory[0] });
    }else{
        res.json({ status: false, message: "backgroundCategory Not Available", statusCode: "404" });
    }} catch (error) {
        console.error(error);
        res.status(200).json({ status: 500, message: error.message });
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
                    Bucket: 'posters-assets',
                    Key: "category/background/" + req.body.name + ".png",
                    Body: req.file.buffer,
                    ContentType: 'image/png', 
                    ACL: 'public-read',
                };
                
                try {
                    const data = await s3.upload(params).promise();
                    const updatedBackgroundCategory = await BackgroundCategory.findOneAndUpdate({_id: req.params.id},
                        {
                            name: req.body.name,
                            icon: new URL(data.Location).pathname,
                        },
                        { new: true }
                    );
                    var uu = await BackgroundCategory.find({_id: req.params.id},{ __v:0}).exec();
                    res.json({ status: true, message: "Background Category Updated Successfully", statusCode: "200", data: uu[0]});
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ status: 500, message: 'An error occurred during background upload.' });
                }
            }else{
                res.json({ status: false, message: "Only Admin Can Access", statusCode: 400 });
            }
        }} catch (error) {
            console.error(error);
            res.status(200).json({ status: 500, message: error.message });
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
                var backgroundCategory = await BackgroundCategory.deleteOne({_id: req.params.id});
                if(backgroundCategory.deletedCount === 1) {
                    res.json({ status: true, message: "Background Category deleted Successfully", statusCode: "200"});
                }else{
                    res.json({ status: false, message: "Background Category Not Found", statusCode: "400"});
                }
            }else{
                res.json({ status: false, message: "Only Admin Can Access", statusCode: 400 });
            }
        }} catch (error) {
            console.error(error);
            res.status(200).json({ status: 500, message: error.message });
        }
    });
});

module.exports = router;