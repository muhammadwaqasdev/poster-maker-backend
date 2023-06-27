const mongoose = require('mongoose');

const designSchema = mongoose.Schema({
    user_id: {
        type: String,
        required: true,
    },
    category_id: {
        type: String,
        required: true,
    },
    size_id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    schema: {
        type: String,
        required: true,
    },
    thumbnail: {
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

module.exports = mongoose.model("Design", designSchema);