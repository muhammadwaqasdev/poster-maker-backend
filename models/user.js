const mongoose = require('mongoose');
const validator = require('validator');
var AutoIncrement = require('mongoose-sequence')(mongoose);

const userSchema = mongoose.Schema({
    id: {
        type: Number
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        validate: (value) => {
            return validator.isEmail(value)
        }
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    is_admin: {
        type: Boolean,
        default: false,
    },
    created_on: {
        type: Date,
        default: Date.now,
    },
    fav: {
        type: Array,
        default: [],
    },
    token: {
        type: String,
    }
});

module.exports = mongoose.model("User", userSchema);