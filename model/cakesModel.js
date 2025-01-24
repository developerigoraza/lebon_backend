const mongoose = require("mongoose");
const cakesSchema = new mongoose.Schema({
  category: { type: String, required: true },
  items: [
    {
      itemImage: { type: String, required: true },
      itemName: { type: String, required: true },
      description: { type: String, required: true },
      price: { type: String, required: true },
      isVeg: { type: Boolean, required: true }, 
      isDeliverable: { type: Boolean, required: true }, 
    },
  ],
});

module.exports = mongoose.model("Cakes", cakesSchema);
