const express = require("express");
const router = express.Router();
const {
  addItemToGallery,
  getGalleryItems,
  deleteGalleryItem,
  addGalleryItem,
  editGalleryItem,
} = require("../controllers/gallaryController");
const validateToken = require("../middleware/validateTokenHandler");

router.get("/", getGalleryItems);
router.use(validateToken);
router.post("/", addGalleryItem);
router.delete("/:itemId", deleteGalleryItem);
router.put("/edit/:itemId", editGalleryItem);

module.exports = router;
