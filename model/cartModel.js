const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
        required: true,
      },
      quantity: { type: Number, default: 1 },
    },
  ],
});

module.exports = mongoose.model("Cart", cartSchema);
