const express = require("express");
const router = express.Router();
const {
  registerCustomer,
  loginCustomer,
  currentCustomer,
} = require("../controllers/customerController");
const validateToken = require("../middleware/validateTokenHandler");

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.get("/current", validateToken, currentCustomer);

module.exports = router;
