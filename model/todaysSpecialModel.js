const mongoose = require("mongoose");
const specialSchema = new mongoose.Schema({
  category: { type: String, required: true },
  items: [
    {
      img: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
      price: { type: String, required: true },
      isVeg: { type: Boolean, required: true }, // Added for vegetarian status
      isDeliverable: { type: Boolean, required: true }, // Added for deliverable status
    },
  ],
});

module.exports = mongoose.model("TodaysSpecial", specialSchema);
