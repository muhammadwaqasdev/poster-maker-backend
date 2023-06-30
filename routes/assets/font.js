const express = require('express');
const router = express.Router();
var jwt = require('jsonwebtoken');

const Font = require('../../models/assets/font');
const middleware = require('../../middleware/auth_middleware');

router.post("/add", middleware, async function(req, res) {
    jwt.verify(req.token, process.env.secret, async (err, authData) => {
        try {
            if (err) {
                res.json({ status: false, message: err.message, statusCode: 403 });
            } else {
                if (authData.user[0].is_admin) {
                    const fontsToAdd = req.body.fonts; // Assuming the request body contains an array of fonts to add
                    const addedFonts = [];

                    for (const fontData of fontsToAdd) {
                        const total = await Font.countDocuments();
                        if (total > 0) {
                            const lastDocument = await Font.findOne({}, {}, { sort: { id: -1 } });
                            var newId = lastDocument.id;
                        } else {
                            var newId = 0;
                        }
                        newId++;

                        var font = await Font.find({ id: newId });
                        if (font.length > 0) {
                            res.json({ status: false, message: "Already Exist", statusCode: 404 });
                            return; // Exit the loop and the function
                        }

                        const newFont = new Font({
                            id: newId,
                            title: fontData.title,
                            src: fontData.src,
                        });
                        await newFont.save();
                        var addedFont = await Font.find({ _id: newFont._id }, { _id: 0, __v: 0 });
                        addedFonts.push(addedFont[0]);
                    }

                    res.json({ status: true, message: "Fonts Added Successfully", statusCode: 200, data: addedFonts });
                } else {
                    res.json({ status: false, message: "Only Admin Can Access", statusCode: 400 });
                }
            }
        } catch (error) {
            console.error(error);
            res.status(200).json({ status: false, statusCode: 500, message: error.message });
        }
    });
});

router.get("/getAll", async function(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
  
    try {
      const skip = (page - 1) * limit;
      const font = await Font.find({}, { _id:0,__v: 0 })
        .skip(skip)
        .limit(limit);
      const totalCount = await Font.countDocuments();
  
      res.json({
        status: true, message: "Success", statusCode: 200, data: font, length: font.length, page: page, totalPages: Math.ceil(totalCount / limit)
      });
    } catch (error) {
      res.json({status: false, message: error.message, statusCode: 500});
    }
  });

router.get("/get/:id", async function(req, res) {
    try{
    var font = await Font.find({ id: req.params.id },{ _id:0,__v:0 });
    if(font.length > 0){
        res.json({ status: true, message: "Success", statusCode: 200 , data: font[0] });
    }else{
        res.json({ status: false, message: "Font Not Available", statusCode: 404 });
    }} catch (error) {
        console.error(error);
        res.status(200).json({ status: false,statusCode: 500, message: error.message });
    }
});

router.patch("/update/:id", middleware, function(req, res) {
    jwt.verify(req.token, process.env.secret, async (err,authData) => {
        try{
        if(err) {
            res.json({ status: false, message: err.message, statusCode: 403 });
        }else {
            if(authData.user[0].is_admin){
                const updatedFont = await Font.findOneAndUpdate({id: req.params.id},
                    {
                        title: req.body.title,
                        src: req.body.src,
                    },
                    { new: true }
                );
                var uu = await Font.find({id: req.params.id},{ _id:0, __v:0}).exec();
                res.json({ status: true, message: "Font Updated Successfully", statusCode: 200, data: uu[0]});
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
                var font = await Font.deleteOne({id: req.params.id});
                if(font.deletedCount === 1) {
                    res.json({ status: true, message: "Font deleted Successfully", statusCode: 200});
                }else{
                    res.json({ status: false, message: "Font Not Found", statusCode: 400});
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