const express = require('express');
const router = express.Router();
var jwt = require('jsonwebtoken');
const s3 = require('../../s3');

const ShapesCategory = require('../../models/catogories/shapes_category');
const Shape = require('../../models/assets/shape');
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
                    const total = await Shape.countDocuments();
                    if (total > 0) {
                        const lastDocument = await Shape.findOne({}, {}, { sort: { id: -1 } });
                        var newId = lastDocument.id;
                    } else {
                        var newId = 0;
                    }
                    newId++;

                    // Process each uploaded file
                    const uploadedShapes = [];
                    for (const file of req.files) {
                        var shape = await Shape.find({ id: newId });
                        if (shape.length > 0) {
                            res.json({ status: false, message: "Already Exist", statusCode: 404 });
                            return; // Exit the loop and the function
                        }
                        const params = {
                            Bucket: 'poster-assets',
                            Key: "assets/shapes/" + newId + ".png",
                            Body: file.buffer,
                            ContentType: file.mimetype,
                            ACL: 'public-read',
                        };
                        try {
                            const data = await s3.upload(params).promise();
                            const shap = await ShapesCategory.find({ _id: req.body.category_id });
                            const newShape = new Shape({
                                id: newId,
                                title: newId,
                                category_id: req.body.category_id,
                                category: shap[0],
                                src: new URL(data.Location).pathname,
                            });
                            await newShape.save();
                            var addedShape = await Shape.find({ _id: newShape._id }, { _id: 0, __v: 0 });
                            uploadedShapes.push(addedShape[0]);
                            newId++;
                        } catch (error) {
                            console.error(error);
                            res.status(500).json({ status: false, statusCode: 500, message: 'An error occurred during shape upload.' });
                            return; // Exit the loop and the function
                        }
                    }
                    res.json({ status: true, message: 'Shapes Added Successfully', statusCode: 200, data: uploadedShapes });
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
      const categories = await Shape.distinct("category_id"); // Get distinct category_ids
      const shape = [];
      
      for (const category of categories) {
        const categoryShapes = await Shape.find({ category_id: category }, { _id: 0, __v: 0 })
          .skip(skip)
          .limit(limit);
        
        shape.push(...categoryShapes.slice(0, limit)); // Push 10 entries of the category to the result array
      }
      
      const totalCount = shape.length;
  
      res.json({
        status: true,
        message: "Success",
        statusCode: 200,
        data: shape,
        length: totalCount,
        page: page,
        totalPages: Math.ceil(totalCount / limit)
      });
    } catch (error) {
      res.json({ status: false, message: error.message, statusCode: 500 });
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
                    Bucket: 'poster-assets',
                    Key: "assets/shapes/" + req.params.id + ".png",
                    Body: req.file.buffer,
                    ContentType: 'image/png', 
                    ACL: 'public-read',
                };
                
                try {
                    const data = await s3.upload(params).promise();
                    const shap = await ShapesCategory.find({ _id: req.body.category_id });
                    const updatedShape = await Shape.findOneAndUpdate({id: req.params.id},
                        {
                            category_id: req.body.category_id,
                            category: shap[0],
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