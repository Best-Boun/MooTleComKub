const express = require("express");
const router = express.Router();

const ProductController = require("../controllers/productController");

const upload = require("../middlewares/upload");

// ดึงสินค้าทั้งหมด
router.get("/", ProductController.getAllProducts);

// ดึงสินค้าตาม ID
router.get("/:id", ProductController.getProductById);

// เพิ่มสินค้า
router.post("/", upload.single("image"), ProductController.createProduct);
// แก้ไขสินค้า
router.put("/:id", upload.single("image"), ProductController.updateProduct);

// ลบสินค้า
router.delete("/:id", ProductController.deleteProduct);

module.exports = router;
