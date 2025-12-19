// models/user-model.js
const mongoose = require("mongoose"); 

const userSchema = mongoose.Schema({
  fullname: String,
  email: String,
  password: String,
  cart: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
  orders: {
    type: Array,
    default: [],
  },
  contact: Number,
  
  // NEW FIELDS
  picture: Buffer, // Changed to Buffer to store image data
  address: String,
  pincode: Number
});

module.exports = mongoose.model("user", userSchema);