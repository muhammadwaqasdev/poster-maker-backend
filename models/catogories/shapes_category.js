const mongoose = require('mongoose');

const shapesCatSchema = mongoose.Schema({
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

module.exports = mongoose.model("ShapesCategories", shapesCatSchema);