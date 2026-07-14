const express = require("express");

const router = express.Router();

const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

// GET ทั้งหมด
router.get("/", getAllCategories);

// GET ตาม ID
router.get("/:id", getCategoryById);

// POST
router.post("/", createCategory);

// PUT
router.put("/:id", updateCategory);

// DELETE
router.delete("/:id", deleteCategory);

module.exports = router;
