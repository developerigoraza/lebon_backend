const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  currentAdmin,
} = require("../controllers/adminController");
const validateToken = require("../middleware/validateTokenHandler");

router.post("/register", registerAdmin);

router.post("/login", loginAdmin);

router.get("/current", validateToken, currentAdmin);

module.exports = router;
