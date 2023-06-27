const express = require('express');
const router = express.Router();
var jwt = require('jsonwebtoken');

const PosterSize = require('../models/poster_sizes');
const middleware = require('../middleware/auth_middleware');

router.post("/add", middleware , async function(req, res) {
    jwt.verify(req.token, process.env.secret, async (err,authData) => {
        if(err) {
            res.json({ status: false, message: err.message, statusCode: 403 });
        }else {
            if(authData.user[0].is_admin){
                var posterSize = await PosterSize.find({product_name: req.body.product_name});
                if(posterSize.length > 0){
                    res.json({ status: false, message: "Already Exist", statusCode: 404});
                }else{
                    const newPosterSize = new PosterSize({
                        name: req.body.name,
                        aspectRatio: req.body.aspectRatio,
                        height: req.body.height,
                        width: req.body.width
                    });
                    await newPosterSize.save();
                    var addedPosterSize = await PosterSize.find({_id: newPosterSize._id}, {__v:0 });
                    res.json({ status: true, message: "Poster Size Added Successfully", statusCode: 200 , data: addedPosterSize[0] });
                }
            }else{
                res.json({ status: false, message: "Only Admin Can Access", statusCode: 400 });
            }
        }
    });
});

router.get("/getAll", async function(req, res) {
    var posterSize = await PosterSize.find({},{__v:0 });
    res.json({ status: true, message: "Success", statusCode: 200 , data: posterSize, length: posterSize.length });
});

router.get("/get/:id", async function(req, res) {
    var posterSize = await PosterSize.find({ _id: req.params.id },{ __v:0 });
    if(posterSize.length > 0){
        res.json({ status: true, message: "Success", statusCode: "200" , data: posterSize[0] });
    }else{
        res.json({ status: false, message: "PosterSize Not Available", statusCode: "404" });
    }
});

router.patch("/update/:id", middleware, function(req, res) {
    jwt.verify(req.token, process.env.secret, async (err,authData) => {
        if(err) {
            res.json({ status: false, message: err.message, statusCode: 403 });
        }else {
            if(authData.user[0].is_admin){
                const updatedPosterSize = await PosterSize.findOneAndUpdate({_id: req.params.id},
                    {
                        name: req.body.name,
                        aspectRatio: req.body.aspectRatio,
                        height: req.body.height,
                        width: req.body.width
                    },
                    { new: true }
                );
                var uu = await PosterSize.find({_id: req.params.id},{ __v:0}).exec();
                res.json({ status: true, message: "PosterSize Updated Successfully", statusCode: "200", data: uu[0]});
            }else{
                res.json({ status: false, message: "Only Admin Can Access", statusCode: 400 });
            }
        }
    });
});

router.post("/delete/:id", middleware, function(req, res) {
    jwt.verify(req.token, process.env.secret, async (err,authData) => {
        if(err) {
            res.json({ message: err.message, statusCode: 403 });
        }else {
            if(authData.user[0].is_admin){
                var posterSize = await PosterSize.deleteOne({_id: req.params.id});
                if(posterSize.deletedCount === 1) {
                    res.json({ status: true, message: "PosterSize deleted Successfully", statusCode: "200"});
                }else{
                    res.json({ status: false, message: "PosterSize Not Found", statusCode: "400"});
                }
            }else{
                res.json({ status: false, message: "Only Admin Can Access", statusCode: 400 });
            }
        }
    });
});

module.exports = router;