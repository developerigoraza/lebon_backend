const express = require("express");
const router = express.Router();
const {
  addItemToGallery,
  getGalleryItems,
  deleteGalleryItem,
  addGalleryItem,
  // editGalleryItem,
} = require("../controllers/galleryController");
const validateToken = require("../middleware/validateTokenHandler");

router.get("/", getGalleryItems);
router.use(validateToken);
router.post("/", addGalleryItem);
router.delete("/:id", deleteGalleryItem);
// router.put("/edit/:id", editGalleryItem);

module.exports = router;
