const mongoose = require('mongoose');

const stickerSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    src: {
        type: String,
        required: true,
    },
    category_id: {
        type: String,
        required: true,
    },
    category: {
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

module.exports = mongoose.model("Sticker", stickerSchema);