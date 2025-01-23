const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  // user_id: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User",
  //   required: false,
  // },
  itemName: { type: String, required: true, unique: true }, 
  description: { type: String, required: true },
  itemImages: { type: [String], required: true, default: [] }, 
  price: { type: Number, required: true },
});

const Menu = mongoose.model("Menu", menuSchema);

module.exports = Menu;
