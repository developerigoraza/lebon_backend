const asyncHandler = require("express-async-handler");
const Product = require("../model/productModel");
const Category = require("../model/categoryModel");
const SubCategory = require("../model/subCategoryModel");
const fs = require("fs");
const upload = require("../middleware/multerConfig");

// Add a new product
const addProduct = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      isVeg,
      isDeliverable,
      category,
      subCategory,
    } = req.body;

    // Validation
    if (!name || !description || !price || !category || !subCategory) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(409).json({ message: "Product already exists" });
    }

    const imageFilenames = req.files.map((file) => file.filename);

    const newProduct = await Product.create({
      name,
      description,
      price,
      isVeg,
      isDeliverable,
      images: imageFilenames,
      category,
      subCategory,
    });

    res.status(201).json({ message: "Product added successfully", newProduct });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all products
// const getProducts = async (req, res) => {
//   try {
//     const products = await Product.find().populate("category subCategory");
//     const productsWithImageURLs = products.map((product) => ({
//       ...product.toObject(),
//       images: product.images.map(
//         (image) => `${req.protocol}://${req.get("host")}/uploads/${image}`
//       ),
//     }));
//     res.status(200).json(productsWithImageURLs);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// ==============

// const getProducts = async (req, res) => {
//   try {
//     let filter = {};

//     // Check if a category filter is provided
//     if (req.query.category) {
//       const categoryName = req.query.category;

//       const category = await Category.findOne({ name: categoryName });

//       if (!category) {
//         return res.status(404).json({ message: "Category not found" });
//       }

//       filter.category = category._id;
//     }

//     const products = await Product.find(filter).populate(
//       "category subCategory"
//     );

//     const productsWithImageURLs = products.map((product) => ({
//       ...product.toObject(),
//       images: product.images.map(
//         (image) => `${req.protocol}://${req.get("host")}/uploads/${image}`
//       ),
//     }));

//     res.status(200).json(productsWithImageURLs);
//   } catch (err) {
//     console.error("Error fetching products:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


const getProducts = async (req, res) => {
    try {
      let filter = {};

      
      if (req.query.category) {
        const categoryName = req.query.category;
        const category = await Category.findOne({ name: categoryName });

        if (!category) {
          return res.status(404).json({ message: "Category not found" });
        }

        filter.category = category._id;
      }

      
      const page = parseInt(req.query.page) || 1; 
      const limit = parseInt(req.query.limit) || 10; 
      const skip = (page - 1) * limit;

    
      const totalProducts = await Product.countDocuments(filter);

      const products = await Product.find(filter)
        .populate("category subCategory")
        .skip(skip)
        .limit(limit);

      const productsWithImageURLs = products.map((product) => ({
        ...product.toObject(),
        images: product.images.map(
          (image) => `${req.protocol}://${req.get("host")}/uploads/${image}`
        ),
      }));

      res.status(200).json({
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
        products: productsWithImageURLs,
      });
    } catch (err) {
      console.error("Error fetching products:", err);
      res.status(500).json({ message: "Server error" });
    }
  };



// ==============

// Get product by ID
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id).populate("category subCategory");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productWithImageURLs = {
      ...product.toObject(),
      images: product.images.map(
        (image) => `${req.protocol}://${req.get("host")}/uploads/${image}`
      ),
    };

    res.status(200).json(productWithImageURLs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//edit product
const editProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
 
    if (req.files && req.files.length > 0) {
      const product = await Product.findById(id);
      if (!product)
        return res.status(404).json({ message: "Product not found" });

      product.images.forEach((image) => {
        try {
          fs.unlinkSync(`uploads/${image}`);
        } catch (err) {
          console.error(`Failed to delete image: ${image}`, err);
        }
      });

      updateData.images = req.files.map((file) => file.filename);
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true, 
      runValidators: true, 
    });

    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });

    res.status(200).json({
      message: "Product updated successfully",
      updatedProduct,
    });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ message: err.message });
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete associated images
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((imagePath) => {
        try {
          fs.unlinkSync(`uploads/${imagePath}`);
        } catch (err) {
          console.error(`Failed to delete image: ${imagePath}`, err);
        }
      });
    }

    // Delete the product
    await Product.findByIdAndDelete(id);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = {
  addProduct,
  getProducts,
  getProductById,
  editProduct,
  deleteProduct,
};
