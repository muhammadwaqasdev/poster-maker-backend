const express = require('express');
const router = express.Router();
var md5 = require('md5');
var jwt = require('jsonwebtoken');
var env = require('dotenv');
env.config();
const User = require('./../models/user');
const middleware = require('./../middleware/auth_middleware');

router.post("/login", async function(req, res) {
    try{
        var email = req.body.email;
        var password = req.body.password;

        var user = await User.find({ email: email, password: md5(password)},{ __v:0, password:0});

        if(user.length > 0){
            const token = jwt.sign({user}, process.env.secret);
            user[0].token = token;
            res.json({ status: true, message: "Congratulation", statusCode: 200 , data: user[0] });
        }else{
            res.json({ status: false, message: "User Not Available With These Credentials", statusCode: 404 });
        }
    }catch(e){
        console.log(e);
    }
});

router.post("/signup", async function(req, res) {
    try{
        var users = await User.find({email: req.body.email});
        if(users.length > 0){
            res.json({ status: false, message: "Already Exist", statusCode: 404});
        }else{
            let newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: md5(req.body.password),
                phone: req.body.phone
            });
            await newUser.save();
            const response = await User.find({email: req.body.email},{ __v:0, password:0});
            const token = jwt.sign({response}, process.env.secret);
            response[0].token = token;
            res.json({ status: true, message: "New User Created Successfully", statusCode: 200 , data: response[0] });
        }
    }catch(e){
        res.json({ status: false, message: e, statusCode: 500});
    }
});

router.get("/getAll", middleware , async function(req, res) {
    jwt.verify(req.token, process.env.secret, async (err, authData) => {
        try{
        if(err) {
            res.json({ status: false, message: err.message, statusCode: 403 });
        }else {
            if(authData.user[0].is_admin){
                var users = await User.find({},{ __v:0, password:0});
                res.json({ status: true, message: "Success", statusCode: 200 , data: users, length: users.length });
            }else{
                res.json({ status: false, message: "Only Admin Can Access", statusCode: 400 });
            }
        }} catch (error) {
            console.error(error);
            res.status(200).json({ status: false,statusCode: 500, message: error.message });
        }
    });
});

router.patch("/update", middleware, function(req, res) {
    jwt.verify(req.token, process.env.secret, async (err,authData) => {
        try{
        if(err) {
            res.json({ status: false, message: err.message, statusCode: 403 });
        }else {
            const updateduser = await User.findOneAndUpdate({_id: authData.user[0]._id},
                {
                    name: req.body.name,
                    email: req.body.email,
                    phone: req.body.phone
                },
                { new: true }
            );
            var uu = await User.find({_id: authData.user[0]._id},{__v:0, password:0}).exec();
            res.json({ status: true, message: "User Updated Successfully", statusCode: 200, data: uu[0]});
        }} catch (error) {
            console.error(error);
            res.status(200).json({ status: false,statusCode: 500, message: error.message });
        }
    });
});

router.patch("/upadatefav/:id", middleware, function(req, res) {
    jwt.verify(req.token, process.env.secret, async (err,authData) => {
        try{
        if(err) {
            res.json({ status: false, message: err.message, statusCode: 403 });
        }else {
            const da = await User.find({_id: authData.user[0]._id}).exec();

            const favList = da[0].fav;
            console.log(authData.user[0]._id);
            console.log(favList);
            if (favList.includes(req.params.id)) {
                // String already exists, remove it
                await User.updateOne({ _id: authData.user[0]._id }, { $pull: { fav: req.params.id } });
                var uu = await User.find({_id: authData.user[0]._id},{ __v:0, password:0}).exec();
                res.json({ status: true, message: "Removed Successfully", statusCode: 200, data: uu[0]});
              } else {
                // String does not exist, add it
                await User.updateOne({ _id: authData.user[0]._id }, { $addToSet: { fav: req.params.id } });
                var uu = await User.find({_id: authData.user[0]._id},{ __v:0, password:0}).exec();
                res.json({ status: true, message: "Added Successfully", statusCode: 200, data: uu[0]});
              }
        }} catch (error) {
            console.error(error);
            res.status(200).json({ status: false,statusCode: 500, message: error.message });
        }
    });
});

router.patch("/setToAdmin/:id", middleware, function(req, res) {
    jwt.verify(req.token, process.env.secret, async (err,authData) => {
        try{
        if(err) {
            res.json({ status: false, message: err.message, statusCode: 403 });
        }else {
            if(authData.user[0].is_admin){
                const data = await User.findOne({_id: req.params.id}).exec();

                if (data.is_admin) {
                    // String already exists, remove it
                    const updateduser = await User.findOneAndUpdate({_id: req.params.id},
                        {
                            is_admin: false
                        },
                        { new: true }
                    );
                    var uu = await User.find({_id: req.params.id},{__v:0, password:0}).exec();
                    res.json({ status: true, message: "User Removed From Admin Successfully", statusCode: 200, data: uu[0]});
                } else {
                    // String does not exist, add it
                    const updateduser = await User.findOneAndUpdate({_id: req.params.id},
                        {
                            is_admin: true
                        },
                        { new: true }
                    );
                    var uu = await User.find({_id: req.params.id},{__v:0, password:0}).exec();
                    res.json({ status: true, message: "User Added in Admin Successfully", statusCode: 200, data: uu[0]});
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

router.post("/delete", middleware, function(req, res) {
    jwt.verify(req.token, process.env.secret, async (err,authData) => {
        try{
        if(err) {
            res.json({ message: err.message, statusCode: 403 });
        }else {
            var user = await User.deleteOne({_id: authData.user[0]._id});
            if(user.deletedCount === 1) {
                res.json({ status: true, message: "User deleted Successfully", statusCode: 200});
            }else{
                res.json({ status: false, message: "User Not Found", statusCode: 400});
            }
        }} catch (error) {
            console.error(error);
            res.status(200).json({ status: false,statusCode: 500, message: error.message });
        }
    });
});

module.exports = router;