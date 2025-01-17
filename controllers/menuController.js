const asyncHandler = require("express-async-handler");
const multer = require("multer");
const path = require("path");
const Menu = require("../model/menuModel");
const fs = require("fs");
const User = require("../model/userModel");

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
});

const addItemToMenu = asyncHandler(async (req, res) => {
  try {
    upload.single("itemImage")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err });
      }

      const { itemName, description, price } = req.body;

      switch (true) {
        case !itemName:
          return res.status(400).json({ message: "Item name is required" });

        case !description:
          return res.status(400).json({ message: "Description is required" });

        case !price:
          return res.status(400).json({ message: "Price is required" });

        case !req.file:
          return res.status(400).json({ message: "Image is required" });

        default:
          break;
      }

      const existingItem = await Menu.findOne({ itemName: itemName });
      if (existingItem) {
        // Delete the uploaded image if the item already exists
        fs.unlinkSync(req.file.path);
        return res
          .status(409)
          .json({ message: "Item already exists in the menu" });
      }

      const newItem = await Menu.create({
        user_id: req.userId,
        itemName,
        description,
        itemImage: req.file.filename,
        price,
      });

      return res
        .status(201)
        .json({ message: "Item added successfully", newItem });
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Get menu items
const getMenuItems = async (req, res) => {
  try {
    const menuItems = await Menu.find();
    res.status(200).json(menuItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//get menu item id

const getItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await Menu.findById(id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.status(200).json(item);
});

// Edit an item in the menu
const editMenuItem = asyncHandler(async (req, res) => {
  try {
    upload.single("itemImage")(req, res, async (err) => {
      if (err) return res.status(400).json({ message: err });

      const { id } = req.params;
      const { itemName, description, price } = req.body;

      const item = await Menu.findById(id);
      if (!item) return res.status(404).json({ message: "Item not found" });

      // Delete the old image if a new image is uploaded
      if (req.file) {
        if (item.itemImage) {
          fs.unlinkSync(`uploads/${item.itemImage}`);
        }
        item.itemImage = req.file.filename;
      }

      // Update other fields
      item.itemName = itemName || item.itemName;
      item.description = description || item.description;
      item.price = price || item.price;

      const updatedItem = await item.save();
      res
        .status(200)
        .json({ message: "Item updated successfully", updatedItem });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete an item from the menu
const deleteMenuItem = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Menu.findById(id);

    if (!item) return res.status(404).json({ message: "Item not found" });

    // Delete the associated image file
    if (item.itemImage) {
      fs.unlinkSync(`uploads/${item.itemImage}`);
    }

    await item.remove();
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = {
  addItemToMenu,
  getMenuItems,
  editMenuItem,
  deleteMenuItem,
  upload,
};

module.exports = { addItemToMenu, getMenuItems, upload };
