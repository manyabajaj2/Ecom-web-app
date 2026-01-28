const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        desc: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000,
        },
        imageurl: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2048,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);


