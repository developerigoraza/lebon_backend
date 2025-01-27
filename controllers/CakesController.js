const asyncHandler = require("express-async-handler");
const Cakes = require("../model/cakesModel"); // Import the Cakes model
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

// Add a new item to the Cakes collection
const addItemToCakes = asyncHandler(async (req, res) => {
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

    const categoryExists = await Cakes.findOne({ category });
    if (categoryExists) {
      const itemExists = categoryExists.items.some(
        (item) => item.itemName === itemName
      );
      if (itemExists) {
        deleteImages(imageFilenames);
        return res
          .status(409)
          .json({ message: "Item already exists in Cakes." });
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
        .json({ message: "Item added to Cakes successfully." });
    } else {
      await Cakes.create({
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

// Get all items from the Cakes collection
const getCakesItems = asyncHandler(async (req, res) => {
  try {
    const cakes = await Cakes.find();
    const itemsWithImageURLs = cakes.flatMap((cake) =>
      cake.items.map((item) => ({
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
const getCakeItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const cake = await Cakes.findOne({ "items._id": id });
    if (!cake) {
      return res.status(404).json({ message: "Item not found." });
    }

    const item = cake.items.id(id);
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

// Edit a specific item in the Cakes collection
const editCakeItem = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err });

    const { id } = req.params;
    const { itemName, description, price, isVeg, isDeliverable } = req.body;

    const cake = await Cakes.findOne({ "items._id": id });
    if (!cake) return res.status(404).json({ message: "Item not found." });

    const item = cake.items.id(id);

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

    await cake.save();
    res.status(200).json({ message: "Item updated successfully." });
  });
});

// Delete a specific item
const deleteCakeItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const cake = await Cakes.findOne({ "items._id": id });
    if (!cake) {
      return res.status(404).json({ message: "Item not found." });
    }

    const item = cake.items.id(id);
    deleteImages(item.itemImages);

    cake.items.pull(id);
    await cake.save();

    res.status(200).json({ message: "Item deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = {
  addItemToCakes,
  getCakesItems,
  getCakeItemById,
  editCakeItem,
  deleteCakeItem,
};
