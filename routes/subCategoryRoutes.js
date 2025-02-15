const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const SubCategory = require("../model/subCategoryModel");
const Category = require("../model/categoryModel");

// Add a new subcategory
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, categoryId } = req.body;

    // Input validation
    if (!name || !categoryId) {
      return res
        .status(400)
        .json({ message: "Name and categoryId are required" });
    }

    // Check if the category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Create and save the subcategory
    const subCategory = new SubCategory({
      name,
      category: categoryId,
    });
    await subCategory.save();

    // Update the parent category
    category.subCategories.push(subCategory._id);
    await category.save();

    res.status(201).json({
      message: "Subcategory added successfully",
      subCategory,
    });
  })
);

// Get all subcategories with their parent categories populated
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const subCategories = await SubCategory.find().populate("category");
    res.status(200).json({
      message: "Subcategories retrieved successfully",
      subCategories,
    });
  })
);

// Edit a subcategory
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, categoryId } = req.body;

    // Input validation
    if (!name && !categoryId) {
      return res
        .status(400)
        .json({
          message: "At least one field (name or categoryId) is required",
        });
    }

    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    if (categoryId) {
      const newCategory = await Category.findById(categoryId);
      if (!newCategory) {
        return res.status(404).json({ message: "New category not found" });
      }

      const oldCategory = await Category.findById(subCategory.category);
      if (oldCategory) {
        oldCategory.subCategories = oldCategory.subCategories.filter(
          (subCatId) => subCatId.toString() !== id
        );
        await oldCategory.save();
      }

      newCategory.subCategories.push(subCategory._id);
      await newCategory.save();

      subCategory.category = categoryId;
    }

    if (name) {
      subCategory.name = name;
    }

    await subCategory.save();

    res.status(200).json({
      message: "Subcategory updated successfully",
      subCategory,
    });
  })
);

// Delete a subcategory
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find the subcategory to get its parent category
    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    // Remove the subcategory from its parent category
    const category = await Category.findById(subCategory.category);
    if (category) {
      category.subCategories = category.subCategories.filter(
        (subCatId) => subCatId.toString() !== id
      );
      await category.save();
    }

    // Delete the subcategory
    await SubCategory.findByIdAndDelete(id);

    res.status(200).json({ message: "Subcategory deleted successfully" });
  })
);

module.exports = router;
