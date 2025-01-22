const asyncHandler = require("express-async-handler");
const multer = require("multer");
const path = require("path");
const Gallery = require("../model/gallaryModel");
const fs = require("fs");

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Set the upload directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb("Error: Only JPEG, JPG, and PNG files are allowed!");
    }
  },
});

// Get Gallery Items
const getGalleryItems = asyncHandler(async (req, res) => {
  const galleryItems = await Gallery.find();
  res.status(200).json(galleryItems);
});

// Add Gallery Item
const addGalleryItem = asyncHandler(async (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const existingItem = await Gallery.findOne({ image: req.file.filename });
    if (existingItem) {
      fs.unlinkSync(`uploads/${req.file.filename}`); // Delete the uploaded file
      return res.status(409).json({ message: "Image already exists in the gallery" });
    }

    const galleryItem = await Gallery.create({ image: req.file.filename });
    res.status(201).json({ message: "Gallery item added successfully", galleryItem });
  });
});

// Delete Gallery Item
const deleteGalleryItem = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Gallery.findById(id);

    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.image) {
      fs.unlinkSync(`uploads/${item.image}`); // Delete the image file
    }

    await item.remove();
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Edit Gallery Item
const editGalleryItem = asyncHandler(async (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    const { id } = req.params;
    const item = await Gallery.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (req.file) {
      // Delete old image file if a new one is uploaded
      if (item.image) {
        fs.unlinkSync(`uploads/${item.image}`);
      }
      item.image = req.file.filename;
    }

    const updatedItem = await item.save();
    res.status(200).json({ message: "Gallery item updated successfully", updatedItem });
  });
});

module.exports = {
  getGalleryItems,
  addGalleryItem,
  deleteGalleryItem,
  editGalleryItem,
};
