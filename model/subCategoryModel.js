const mongoose = require("mongoose");
const Category = require("./categoryModel");

const subCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  //   description: { type: String },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
});

module.exports = mongoose.model("SubCategory", subCategorySchema);
