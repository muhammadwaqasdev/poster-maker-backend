//initailization Express Server
const express = require('express');
const app = express();



app.get('/', function (req, res) {
    res.json({message: "Welcome to Poster Maker and Design Maker! Api Server"});
});

const uploadRouter = require('./routes/upload');
app.use("/api", uploadRouter);



const PORT = process.env.PORT || 4000;
app.listen(PORT, function() {
    console.log("Server started at PORT: " + PORT);
});