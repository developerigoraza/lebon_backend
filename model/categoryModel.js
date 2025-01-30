const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  //   description: { type: String },
  subCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" }],
});

module.exports = mongoose.model("Category", categorySchema);
