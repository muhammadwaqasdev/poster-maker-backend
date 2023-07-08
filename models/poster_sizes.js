const mongoose = require('mongoose');

const posterSizeSchema = mongoose.Schema({
    aspectRatio: {
        type: Number,
        required: true,
    },
    height: {
        type: Number,
        required: true,
    },
    width: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        required: true,
    },
    created_on: {
        type: Date,
        default: Date.now,
    },
    updated_on: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("PosterSize", posterSizeSchema);