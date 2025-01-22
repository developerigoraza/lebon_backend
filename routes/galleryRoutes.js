const express = require("express");
const router = express.Router();
const {
    addItemToGallery,
    getGalleryItems,
    deleteGalleryItem,
    editGalleryItem
} = require("../controllers/galleryController");
const validateToken = require("../middleware/validateTokenHandler");

router.get("/", getGalleryItems);
router.use(validateToken); 
router.post("/", addItemToGallery); 
router.delete("/:itemId", deleteGalleryItem);
router.put("/edit/:itemId", editGalleryItem);

module.exports = router;