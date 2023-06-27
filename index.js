//initailization Express Server
const express = require('express');
const moment = require('moment');
const app = express();
const connectDB = require('./db');

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//decleared api routes
const user = require('./models/user');

connectDB();

app.get('/', function (req, res) {
    res.json({message: "Welcome to Poster Maker and Design Maker! Api Server with MogoDB Server(Mongoose)"});
});

//Auth Apis
const authRouter = require('./routes/auth');
app.use("/api/user", authRouter);
//Poster Sizes Apis
const posterSizeRouter = require('./routes/poster_size');
app.use("/api/postersize", posterSizeRouter);
//Poster Sizes Apis
const designRouter = require('./routes/designs');
app.use("/api/design", designRouter);

//upload images to s3 bucket
const uploadRouter = require('./routes/upload');
app.use("/api", uploadRouter);



const PORT = process.env.PORT || 4000;
app.listen(PORT, function() {
    console.log("Server started at PORT: " + PORT);
});