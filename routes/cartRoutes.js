const express = require("express");
const router = express.Router();
const { getMenuItems, getCart, addToCart, removeFromCart, checkout } = require("../controllers/cartController");
const validateToken = require("../middleware/validateTokenHandler");

router.use(validateToken); // Routes below are private
router.get("/", getCart);
router.post("/", addToCart);
router.delete("/:itemId", removeFromCart);
router.post("/checkout", checkout);

module.exports = router;
