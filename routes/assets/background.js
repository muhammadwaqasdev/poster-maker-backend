const express = require('express');
const router = express.Router();
var jwt = require('jsonwebtoken');
const s3 = require('../../s3');

const Background = require('../../models/assets/background');
const middleware = require('../../middleware/auth_middleware');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fieldSize: 2 * 1024 * 1024 }
});

router.post("/add", middleware, upload.array('images'), async function(req, res) {
    jwt.verify(req.token, process.env.secret, async (err, authData) => {
        try {
            if (err) {
                res.json({ status: false, message: err.message, statusCode: 403 });
            } else {
                if (authData.user[0].is_admin) {
                    const total = await Background.countDocuments();
                    if (total > 0) {
                        const lastDocument = await Background.findOne({}, {}, { sort: { id: -1 } });
                        var newId = lastDocument.id;
                    } else {
                        var newId = 0;
                    }
                    newId++;

                    // Process each uploaded file
                    const uploadedFiles = [];
                    for (const file of req.files) {
                        var background = await Background.find({ id: newId });
                        if (background.length > 0) {
                            res.json({ status: false, message: "Already Exist", statusCode: 404 });
                            return; // Exit the loop and the function
                        }
                        const params = {
                            Bucket: 'posters-assets',
                            Key: "assets/background/" + newId + ".png",
                            Body: file.buffer,
                            ContentType: file.mimetype,
                            ACL: 'public-read',
                        };
                        try {
                            const data = await s3.upload(params).promise();
                            const newBackground = new Background({
                                id: newId,
                                title: file.originalname.substring(0, file.originalname.lastIndexOf('.')),
                                category_id: req.body.category_id,
                                src: new URL(data.Location).pathname,
                            });
                            await newBackground.save();
                            var addedBackground = await Background.find({ _id: newBackground._id }, { _id: 0, __v: 0 });
                            uploadedFiles.push(addedBackground[0]);
                            newId++;
                        } catch (error) {
                            console.error(error);
                            res.status(500).json({ status: false, statusCode: 500, message: 'An error occurred during background upload.' });
                            return; // Exit the loop and the function
                        }
                    }
                    res.json({ status: true, statusCode: 200, message: 'Backgrounds Added Successfully', data: uploadedFiles });
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
    const limit = parseInt(req.query.limit) || 1000;
  
    try {
      const skip = (page - 1) * limit;
      const background = await Background.find({}, { _id:0,__v: 0 })
        .skip(skip)
        .limit(limit);
      const totalCount = await Background.countDocuments();
  
      res.json({
        status: true, message: "Success", statusCode: 200, data: background, length: background.length, page: page, totalPages: Math.ceil(totalCount / limit)
      });
    } catch (error) {
      res.json({status: false, message: error.message, statusCode: 500});
    }
  });

router.get("/get/:id", async function(req, res) {
    try{
    var background = await Background.find({ id: req.params.id },{ _id:0, __v:0 });
    if(background.length > 0){
        res.json({ status: true, message: "Success", statusCode: 200 , data: background[0] });
    }else{
        res.json({ status: false, message: "background Not Available", statusCode: 404 });
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
                    Key: "assets/background/" + req.params.id + ".png",
                    Body: req.file.buffer,
                    ContentType: 'image/png', 
                    ACL: 'public-read',
                };
                
                try {
                    const data = await s3.upload(params).promise();
                    const updatedBackground = await Background.findOneAndUpdate({id: req.params.id},
                        {
                            category_id: req.body.category_id,
                            title: req.file.originalname.substring(0, req.file.originalname.lastIndexOf('.')),
                            src: new URL(data.Location).pathname,
                        },
                        { new: true }
                    );
                    var uu = await Background.find({id: req.params.id},{ _id:0,__v:0}).exec();
                    res.json({ status: true, message: "Background Updated Successfully", statusCode: 200, data: uu[0]});
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ status: false,statusCode: 500, message: 'An error occurred during background upload.' });
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
                var background = await Background.deleteOne({id: req.params.id});
                if(background.deletedCount === 1) {
                    res.json({ status: true, message: "Background deleted Successfully", statusCode: 200});
                }else{
                    res.json({ status: false, message: "Background Not Found", statusCode: 400});
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