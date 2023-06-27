const mongoose = require('mongoose');
// const validator = require('validator');
var AutoIncrement = require('mongoose-sequence')(mongoose);

const assetSchema = mongoose.Schema({
    id: {
        type: Number
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
userSchema.plugin(AutoIncrement, {id:'id',inc_field: 'id'});

module.exports = mongoose.model("Asset", assetSchema);