const express = require('express');
const router = express.Router();
var jwt = require('jsonwebtoken');

const FancyFont = require('../../models/assets/fancy_font');
const middleware = require('../../middleware/auth_middleware');

router.post("/add", middleware , async function(req, res) {
    jwt.verify(req.token, process.env.secret, async (err,authData) => {
        try{
        if(err) {
            res.json({ status: false, message: err.message, statusCode: 403 });
        }else {
            if(authData.user[0].is_admin){
                const total = await FancyFont.countDocuments();
                if(total > 0){
                    const lastDocument = await FancyFont.findOne({}, {}, { sort: { id: -1 } });
                    var newId = lastDocument.id;
                }else{
                    var newId = 0;
                }
                newId++;
                var fancyFont = await FancyFont.find({id: newId});
                if(fancyFont.length > 0){
                    res.json({ status: false, message: "Already Exist", statusCode: 404});
                }else{
                    const newFancyFont = new FancyFont({
                        id: newId,
                        title: req.body.title,
                        src: req.body.src,
                    });
                    await newFancyFont.save();
                    var addedFancyFont = await FancyFont.find({_id: newFancyFont._id}, { _id:0, __v:0 });
                    res.json({ status: true, message: "FancyFont Added Successfully", statusCode: 200 , data: addedFancyFont[0] });
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
    const limit = parseInt(req.query.limit) || 10;
  
    try {
      const skip = (page - 1) * limit;
      const fancyFont = await FancyFont.find({}, { _id:0,__v: 0 })
        .skip(skip)
        .limit(limit);
      const totalCount = await FancyFont.countDocuments();
  
      res.json({
        status: true, message: "Success", statusCode: 200, data: fancyFont, length: fancyFont.length, page: page, totalPages: Math.ceil(totalCount / limit)
      });
    } catch (error) {
      res.json({status: false, message: error.message, statusCode: 500});
    }
  });

router.get("/get/:id", async function(req, res) {
    try{
    var fancyFont = await FancyFont.find({ id: req.params.id },{ _id:0,__v:0 });
    if(fancyFont.length > 0){
        res.json({ status: true, message: "Success", statusCode: "200" , data: fancyFont[0] });
    }else{
        res.json({ status: false, message: "FancyFont Not Available", statusCode: "404" });
    }} catch (error) {
        console.error(error);
        res.status(200).json({ status: 500, message: error.message });
    }
});

router.patch("/update/:id", middleware, function(req, res) {
    jwt.verify(req.token, process.env.secret, async (err,authData) => {
        try{
        if(err) {
            res.json({ status: false, message: err.message, statusCode: 403 });
        }else {
            if(authData.user[0].is_admin){
                const updatedFancyFont = await FancyFont.findOneAndUpdate({id: req.params.id},
                    {
                        title: req.body.title,
                        src: req.body.src,
                    },
                    { new: true }
                );
                var uu = await FancyFont.find({id: req.params.id},{ _id:0, __v:0}).exec();
                res.json({ status: true, message: "FancyFont Updated Successfully", statusCode: "200", data: uu[0]});
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
                var fancyFont = await FancyFont.deleteOne({id: req.params.id});
                if(fancyFont.deletedCount === 1) {
                    res.json({ status: true, message: "FancyFont deleted Successfully", statusCode: "200"});
                }else{
                    res.json({ status: false, message: "FancyFont Not Found", statusCode: "400"});
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