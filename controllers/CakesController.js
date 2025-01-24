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

// Add a new item to the Cakes collection
  const addItemToCakes = asyncHandler(async (req, res) => {
    try {
      upload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ message: err });
        }

        const { itemName, description, price, category, isVeg, isDeliverable } = req.body;

        switch (true) {
          case !itemName:
            return res.status(400).json({ message: "Item name is required" });
          case !description:
            return res.status(400).json({ message: "Description is required" });
          case !price:
            return res.status(400).json({ message: "Price is required" });
          case req.files.length === 0:
            return res.status(400).json({ message: "At least one image is required" });
          default:
            break;
        }

        const existingItem = await Cakes.findOne({ "items.title": itemName });
        if (existingItem) {
          req.files.forEach((file) => fs.unlinkSync(file.path));
          return res.status(409).json({ message: "Item already exists in Cakes" });
        }

        const imageFilenames = req.files.map((file) => file.filename);

        const newItem = await Cakes.create({
          category,
          items: [
            {
              title: itemName,
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
          .json({ message: "Item added to Cakes successfully", newItem });
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  });

// Get all items from the Cakes collection
const getCakesItems = async (req, res) => {
  try {
    const cakes = await Cakes.find();
    const itemsWithImageURLs = cakes.flatMap(cake =>
      cake.items.map(item => ({
        ...item,
        itemImages: item.itemImages.map(
          image => `${req.protocol}://${req.get("host")}/uploads/${image}`
        ),
      }))
    );
    res.status(200).json(itemsWithImageURLs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a specific item from the Cakes collection by its ID
const getCakeItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const cake = await Cakes.findOne({ "items._id": id });
    if (!cake) {
      return res.status(404).json({ message: "Item not found" });
    }

    const item = cake.items.id(id); // Find the specific item by its ID

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
  try {
    upload(req, res, async (err) => {
      if (err) return res.status(400).json({ message: err });

      const { id } = req.params;
      const { itemName, description, price, isVeg, isDeliverable } = req.body;

      const cake = await Cakes.findOne({ "items._id": id });
      if (!cake) return res.status(404).json({ message: "Item not found" });

      const item = cake.items.id(id);

      // Delete old images if new ones are uploaded
      if (req.files.length > 0) {
        item.itemImages.forEach((image) => fs.unlinkSync(`uploads/${image}`));
        item.itemImages = req.files.map((file) => file.filename);
      }

      // Update other fields
      item.title = itemName || item.title;
      item.description = description || item.description;
      item.price = price || item.price;
      item.isVeg = isVeg !== undefined ? isVeg : item.isVeg;
      item.isDeliverable = isDeliverable !== undefined ? isDeliverable : item.isDeliverable;

      const updatedCake = await cake.save();
      res
        .status(200)
        .json({ message: "Item updated in Cakes successfully", updatedCake });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a specific item from the Cakes collection
const deleteCakeItem = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const cake = await Cakes.findOne({ "items._id": id });

    if (!cake) {
      return res.status(404).json({ message: "Item not found" });
    }

    const item = cake.items.id(id);
    if (item.itemImages && Array.isArray(item.itemImages)) {
      item.itemImages.forEach((imagePath) => {
        try {
          fs.unlinkSync(`uploads/${imagePath}`);
        } catch (err) {
          console.error(`Failed to delete image: ${imagePath}`, err);
        }
      });
    }

    // Remove the item from the Cakes collection
    cake.items.pull(id);
    await cake.save();

    res.status(200).json({ message: "Item deleted from Cakes successfully" });
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
  upload,
};
