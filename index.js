//initailization Express Server
const express = require('express');
const moment = require('moment');
const app = express();
const connectDB = require('./db');

const bodyParser = require('body-parser');

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' })); 


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
//Designs Apis
const designRouter = require('./routes/designs');
app.use("/api/design", designRouter);


//Design Category Apis
const designCatRouter = require('./routes/catogories/design_category');
app.use("/api/designCat", designCatRouter);
//Background Category Apis
const backgroundCatRouter = require('./routes/catogories/backgrounds_category');
app.use("/api/bgCat", backgroundCatRouter);
//Shapes Category Apis
const shapesCatRouter = require('./routes/catogories/shapes_category');
app.use("/api/shapesCat", shapesCatRouter);
//Stickers Category Apis
const stickersCatRouter = require('./routes/catogories/stickers_category');
app.use("/api/stickersCat", stickersCatRouter);


//Background Assets Apis
const backgroundRouter = require('./routes/assets/background');
app.use("/api/bd", backgroundRouter);
//Shape Assets Apis
const shapeRouter = require('./routes/assets/shape');
app.use("/api/shape", shapeRouter);
//Sticker Assets Apis
const stickerRouter = require('./routes/assets/sticker');
app.use("/api/sticker", stickerRouter);
//Font Assets Apis
const fontRouter = require('./routes/assets/font');
app.use("/api/font", fontRouter);
//Font Assets Apis
const fancyFontRouter = require('./routes/assets/fancy_font');
app.use("/api/fancyFont", fancyFontRouter);


//upload images to s3 bucket
const uploadRouter = require('./routes/upload');
app.use("/api", uploadRouter);


const PORT = process.env.PORT || 4000;
app.listen(PORT, function() {
    console.log("Server started at PORT: " + PORT);
});