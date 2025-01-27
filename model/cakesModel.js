const mongoose = require("mongoose");
const cakesSchema = new mongoose.Schema({
  category: { type: String, required: true },
  items: [
    {
      itemName: { type: String, required: true },
      itemImages: { type: [String], required: true, default: [] },
      description: { type: String, required: true },
      price: { type: String, required: true },
      isVeg: { type: Boolean, required: true },
      isDeliverable: { type: Boolean, required: true },
    },
  ],
});

module.exports = mongoose.model("Cakes", cakesSchema);
