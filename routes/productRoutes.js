const express = require("express");
const router = express.Router();
const {
  addProduct,
  getProducts,
  getProductById,
  editProduct,
  deleteProduct,
} = require("../controllers/productController");
const upload = require("../middleware/multerConfig");
const validateToken = require("../middleware/validateTokenHandler");

router.post("/", validateToken, upload, addProduct);
router.put("/:id", validateToken, upload, editProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.delete("/:id", validateToken, deleteProduct);

module.exports = router;
