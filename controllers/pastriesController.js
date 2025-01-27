const asyncHandler = require("express-async-handler");
const Pastries = require("../model/pastriesModel"); // Import the Pastries model
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extName = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = fileTypes.test(file.mimetype);

    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb("Error: Images only!");
    }
  },
}).array("itemImages", 5);

// Helper function to delete images
const deleteImages = (images) => {
  images.forEach((imagePath) => {
    try {
      fs.unlinkSync(`uploads/${imagePath}`);
    } catch (err) {
      console.error(`Failed to delete image: ${imagePath}`, err);
    }
  });
};

// Add a new item to the Pastries collection
const addItemToPastries = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    const { itemName, description, price, category, isVeg, isDeliverable } =
      req.body;

    if (!itemName || !description || !price || req.files.length === 0) {
      return res.status(400).json({
        message: "All fields are required, including at least one image.",
      });
    }

    const imageFilenames = req.files.map((file) => file.filename);

    const categoryExists = await Pastries.findOne({ category });
    if (categoryExists) {
      const itemExists = categoryExists.items.some(
        (item) => item.itemName === itemName
      );
      if (itemExists) {
        deleteImages(imageFilenames);
        return res
          .status(409)
          .json({ message: "Item already exists in Pastries." });
      }

      categoryExists.items.push({
        itemName,
        description,
        price,
        itemImages: imageFilenames,
        isVeg,
        isDeliverable,
      });
      await categoryExists.save();
      return res
        .status(201)
        .json({ message: "Item added to Pastries successfully." });
    } else {
      await Pastries.create({
        category,
        items: [
          {
            itemName,
            description,
            price,
            itemImages: imageFilenames,
            isVeg,
            isDeliverable,
          },
        ],
      });
      return res
        .status(201)
        .json({ message: "Category and item created successfully." });
    }
  });
});

// Get all items from the Pastries collection
const getPastriesItems = asyncHandler(async (req, res) => {
  try {
    const pastries = await Pastries.find();
    const itemsWithImageURLs = pastries.flatMap((pastry) =>
      pastry.items.map((item) => ({
        ...item.toObject(),
        itemImages: item.itemImages.map(
          (image) => `${req.protocol}://${req.get("host")}/uploads/${image}`
        ),
      }))
    );
    res.status(200).json(itemsWithImageURLs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific item by ID
const getPastryItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const pastry = await Pastries.findOne({ "items._id": id });
    if (!pastry) {
      return res.status(404).json({ message: "Item not found." });
    }

    const item = pastry.items.id(id);
    const itemWithImageURLs = {
      ...item.toObject(),
      itemImages: item.itemImages.map(
        (image) => `${req.protocol}://${req.get("host")}/uploads/${image}`
      ),
    };

    res.status(200).json(itemWithImageURLs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Edit a specific item in the Pastries collection
const editPastryItem = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err });

    const { id } = req.params;
    const { itemName, description, price, isVeg, isDeliverable } = req.body;

    const pastry = await Pastries.findOne({ "items._id": id });
    if (!pastry) return res.status(404).json({ message: "Item not found." });

    const item = pastry.items.id(id);

    if (req.files.length > 0) {
      deleteImages(item.itemImages);
      item.itemImages = req.files.map((file) => file.filename);
    }

    item.itemName = itemName || item.itemName;
    item.description = description || item.description;
    item.price = price || item.price;
    item.isVeg = isVeg !== undefined ? isVeg : item.isVeg;
    item.isDeliverable =
      isDeliverable !== undefined ? isDeliverable : item.isDeliverable;

    await pastry.save();
    res.status(200).json({ message: "Item updated successfully." });
  });
});

// Delete a specific item
const deletePastryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const pastry = await Pastries.findOne({ "items._id": id });
    if (!pastry) {
      return res.status(404).json({ message: "Item not found." });
    }

    const item = pastry.items.id(id);
    deleteImages(item.itemImages);

    pastry.items.pull(id);
    await pastry.save();

    res.status(200).json({ message: "Item deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = {
  addItemToPastries,
  getPastriesItems,
  getPastryItemById,
  editPastryItem,
  deletePastryItem,
};
