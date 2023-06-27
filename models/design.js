const mongoose = require('mongoose');
// const validator = require('validator');
var AutoIncrement = require('mongoose-sequence')(mongoose);

const designSchema = mongoose.Schema({
    id: {
        type: Number
    },
    user_id: {
        type: Number,
        required: true,
    },
    category_id: {
        type: Number,
        required: true,
    },
    size_id: {
        type: Number,
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
userSchema.plugin(AutoIncrement, {id:'id',inc_field: 'id'});

module.exports = mongoose.model("Design", designSchema);