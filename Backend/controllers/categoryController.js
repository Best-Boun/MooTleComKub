const CategoryModel = require("../models/categoryModel");

// GET /api/categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.getAllCategories();

    res.json({
      success: true,
      total: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// GET /api/categories/:id
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await CategoryModel.getCategoryById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { category_name, description, status } = req.body;

    if (!category_name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const categoryId = await CategoryModel.createCategory({
      category_name,
      description,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category_id: categoryId,
    });
  } catch (error) {
    console.error(error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "ชื่อหมวดหมู่นี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// PUT /api/categories/:id
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, description, status } = req.body;

    const affectedRows = await CategoryModel.updateCategory(id, {
      category_name,
      description,
      status,
    });

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error(error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "ชื่อหมวดหมู่นี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const affectedRows = await CategoryModel.deleteCategory(id);

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
