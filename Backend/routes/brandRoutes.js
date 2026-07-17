const express = require("express");
const router = express.Router();

const BrandController = require("../controllers/brandController");

// GET /api/brands/category/:categoryId
router.get("/category/:categoryId", BrandController.getBrandsByCategory);

// GET /api/brands/:id
router.get("/:id", BrandController.getBrandById);

module.exports = router;
