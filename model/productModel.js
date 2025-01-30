const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  description: { type: String, required: true },
  price: { type: Number, required: true },
  isVeg: { type: Boolean, required: true }, 
  isDeliverable: { type: Boolean, required: true },
  images: [{ type: String }], 
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, 
  subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: true }, 
});

module.exports = mongoose.model('Product', productSchema);