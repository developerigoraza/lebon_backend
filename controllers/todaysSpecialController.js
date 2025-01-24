const asyncHandler = require("express-async-handler");
const multer = require("multer");
const path = require("path");
const TodaysSpecial = require("../model/todaysSpecialModel"); 
const fs = require("fs");

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


const addItemToSpecial = asyncHandler(async (req, res) => {
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
          return res
            .status(400)
            .json({ message: "At least one image is required" });
        default:
          break;
      }

      const existingItem = await TodaysSpecial.findOne({ "items.title": itemName });
      if (existingItem) {
        req.files.forEach((file) => fs.unlinkSync(file.path));
        return res
          .status(409)
          .json({ message: "Item already exists in the special menu" });
      }

      const imageFilenames = req.files.map((file) => file.filename);

      const newItem = await TodaysSpecial.create({
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
        .json({ message: "Item added to Today's Special successfully", newItem });
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


const getSpecialItems = async (req, res) => {
  try {
    const specials = await TodaysSpecial.find();
    const itemsWithImageURLs = specials.flatMap(special =>
      special.items.map(item => ({
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


const getSpecialItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const special = await TodaysSpecial.findOne({ "items._id": id });
    if (!special) {
      return res.status(404).json({ message: "Item not found" });
    }

    const item = special.items.id(id); 

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


const editSpecialItem = asyncHandler(async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) return res.status(400).json({ message: err });

      const { id } = req.params;
      const { itemName, description, price, isVeg, isDeliverable } = req.body;

      const special = await TodaysSpecial.findOne({ "items._id": id });
      if (!special) return res.status(404).json({ message: "Item not found" });

      const item = special.items.id(id);

      
      if (req.files.length > 0) {
        item.itemImages.forEach((image) => fs.unlinkSync(`uploads/${image}`));
        item.itemImages = req.files.map((file) => file.filename);
      }

     
      item.title = itemName || item.title;
      item.description = description || item.description;
      item.price = price || item.price;
      item.isVeg = isVeg !== undefined ? isVeg : item.isVeg;
      item.isDeliverable = isDeliverable !== undefined ? isDeliverable : item.isDeliverable;

      const updatedSpecial = await special.save();
      res
        .status(200)
        .json({ message: "Item updated in Today's Special successfully", updatedSpecial });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete an item from Today's Special menu
const deleteSpecialItem = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const special = await TodaysSpecial.findOne({ "items._id": id });

    if (!special) {
      return res.status(404).json({ message: "Item not found" });
    }

    const item = special.items.id(id);
    if (item.itemImages && Array.isArray(item.itemImages)) {
      item.itemImages.forEach((imagePath) => {
        try {
          fs.unlinkSync(`uploads/${imagePath}`);
        } catch (err) {
          console.error(`Failed to delete image: ${imagePath}`, err);
        }
      });
    }

    special.items.pull(id);
    await special.save();

    res.status(200).json({ message: "Item deleted from Today's Special successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = {
  addItemToSpecial,
  getSpecialItems,
  getSpecialItemById,
  editSpecialItem,
  deleteSpecialItem,
  upload,
};
