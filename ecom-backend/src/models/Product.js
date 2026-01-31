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
            trim: true,
            maxlength: 2048,
        },
        images: {
            type: [String],
            default: [],
            validate: {
                validator: function (arr) {
                    return Array.isArray(arr);
                },
                message: 'Images must be an array'
            }
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


