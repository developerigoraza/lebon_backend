const mongoose = require("mongoose");

const menuSchema = mongoose.Schema(
  {
    // user_id: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: true,
    //   ref: "User",
    // },
    itemName: {
      type: String,
      required: [true, "Please add the Item Name"],
    },
    description: {
      type: String,
      required: [true, "Please add the description"],
    },
    itemImage: {
      type: String,
      required: [true, "Please add the  item image"],
    },
    price: {
      type: String,
      required: [true, "Please add the price"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Menu", menuSchema);
