const mongoose = require('mongoose');

const fancyFontSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    src: {
        type: String,
        required: true,
    },
    title: {
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

module.exports = mongoose.model("FancyFont", fancyFontSchema);