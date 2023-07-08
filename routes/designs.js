const express = require('express');
const router = express.Router();
var jwt = require('jsonwebtoken');

const DesignCategory = require('../models/catogories/design_category');
const Design = require('../models/design');
const middleware = require('../middleware/auth_middleware');

router.post("/add", middleware, async function(req, res) {
    jwt.verify(req.token, process.env.secret, async (err,authData) => {
        try{
        if(err) {
            res.json({ status: false, message: err.message, statusCode: 403 });
        }else {
            var design = await Design.find({name: req.body.name});
            const des = await DesignCategory.find({ _id: req.body.category_id });
            if(design.length > 0){
                res.json({ status: false, message: "Already Exist Please Reanme", statusCode: 404});
            }else{
                const newDesign = new Design({
                    user_id: authData.user[0]._id,
                    category_id: req.body.category_id,
                    category: des[0],
                    size_id: req.body.size_id,
                    name: req.body.name,
                    schema: req.body.schema,
                    thumbnail: req.body.thumbnail
                });
                await newDesign.save();
                var addedDesign = await Design.find({_id: newDesign._id}, {__v:0 });
                res.json({ status: true, message: "Poster Size Added Successfully", statusCode: 200 , data: addedDesign[0] });
            }
        }} catch (error) {
            console.error(error);
            res.status(200).json({ status: false,statusCode: 500, message: error.message });
        }
    });
});

router.get("/getMyAll", middleware, async function(req, res) {
    jwt.verify(req.token, process.env.secret, async (err, authData) => {
      try {
        if (err) {
          res.json({ status: false, message: err.message, statusCode: 403 });
        } else {
          const page = parseInt(req.query.page) || 1;
          const limit = parseInt(req.query.limit) || 1000;
  
          try {
            const skip = (page - 1) * limit;
            const categories = await Design.distinct("category_id", { user_id: authData.user[0]._id }); // Get distinct category_ids for the user
            const design = [];
  
            for (const category of categories) {
              const categoryDesigns = await Design.find({ user_id: authData.user[0]._id, category_id: category }, { __v: 0 })
                .skip(skip)
                .limit(limit);
  
              design.push(...categoryDesigns.slice(0, limit)); // Push 10 entries of the category to the result array
            }
  
            const totalCount = design.length;
  
            res.json({
              status: true,
              message: "Success",
              statusCode: 200,
              data: design,
              length: totalCount,
              page: page,
              totalPages: Math.ceil(totalCount / limit)
            });
          } catch (error) {
            res.json({ status: false, message: error.message, statusCode: 500 });
          }
        }
      } catch (error) {
        console.error(error);
        res.status(200).json({ status: false, statusCode: 500, message: error.message });
      }
    });
  });
  

  router.get("/getAllAdmin", async function(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000;
    
    try {
      const skip = (page - 1) * limit;
      const categories = await Design.distinct("category_id", { user_id: "64a9b1217c55a767c6476d10" }); // Get distinct category_ids
      const design = [];
      
      for (const category of categories) {
        const categoryDesigns = await Design.find({ category_id: category, user_id: "64a9b1217c55a767c6476d10"}, { __v: 0 })
          .skip(skip)
          .limit(limit);
        
        design.push(...categoryDesigns.slice(0, limit)); // Push 10 entries of the category to the result array
      }
      
      const totalCount = design.length;
  
      res.json({
        status: true,
        message: "Success",
        statusCode: 200,
        data: design,
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
    var design = await Design.find({ _id: req.params.id },{ __v:0 });
    if(design.length > 0){
        res.json({ status: true, message: "Success", statusCode: 200 , data: design[0] });
    }else{
        res.json({ status: false, message: "Design Not Available", statusCode: 404 });
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
              const des = await DesignCategory.find({ _id: req.body.category_id });
                const updatedDesign = await Design.findOneAndUpdate({_id: req.params.id},
                    {
                        category_id: req.body.category_id,
                        category: des[0],
                        size_id: req.body.size_id,
                        name: req.body.name,
                        schema: req.body.schema,
                        thumbnail: req.body.thumbnail
                    },
                    { new: true }
                );
                var uu = await Design.find({_id: req.params.id},{ __v:0}).exec();
                res.json({ status: true, message: "Design Updated Successfully", statusCode: 200, data: uu[0]});
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
                var design = await Design.deleteOne({_id: req.params.id});
                if(design.deletedCount === 1) {
                    res.json({ status: true, message: "Design deleted Successfully", statusCode: 200});
                }else{
                    res.json({ status: false, message: "Design Not Found", statusCode: 400});
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