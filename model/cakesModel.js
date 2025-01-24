const mongoose = require("mongoose");
const cakesSchema = new mongoose.Schema({
  // category: { type: String, required: true },
  // items: [
  //   {
  //     itemImage: { type: String, required: true },
  //     title: { type: String, required: true },
  //     description: { type: String, required: true },
  //     price: { type: String, required: true },
  //     isVeg: { type: Boolean, required: true }, // Added for vegetarian status
  //     isDeliverable: { type: Boolean, required: true }, // Added for deliverable status
  //   },
  // ],

  itemName: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  itemImages: { type: [String], required: true, default: [] },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  isVeg: { type: Boolean, required: true, default: true },
  isDeliverable: { type: Boolean, required: true, default: true },
},{
  timestamps: true
});

module.exports = mongoose.model("Cakes", cakesSchema);
