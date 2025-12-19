const mongoose = require ("mongoose");

const productSchema = mongoose.Schema({
    image: Buffer,
    name: String,
    price: Number,
    discount: {
        type: Number,
        default: 0
    },
    bgcolor: String,
    panelcolor: String,
    textcolor: String,
    // NEW FIELDS
    createdAt: {
        type: Date,
        default: Date.now
    },
    stock: {
        type: Number,
        default: 10  // Default stock quantity
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    views: {
        type: Number,
        default: 0  // Track popularity
    }
});

module.exports = mongoose.model("product", productSchema);