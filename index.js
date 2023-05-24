//initailization Express Server
const express = require('express');
const app = express();


app.get('/', function (req, res) {
    res.json({message: "Welcome to Node.js Api Server with MogoDB Server(Mongoose)"});
});

const uploadRouter = require('./routes/upload');
app.use("/api", uploadRouter);


const PORT = process.env.PORT || 4001;
app.listen(PORT, function() {
    console.log("Server started at PORT: " + PORT);
});