const express = require("express");
const router = express.Router();

const {
  getByProduct,
  compare,
  updateProductSpecs,
} = require("../controllers/productSpecController");

const authMiddleware = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/roleMiddleware");
const ROLES = require("../utils/roles");

// ดึงสเปคของสินค้าเดียว (login แล้วเข้าถึงได้ทุก role)
router.get("/product/:productId", authMiddleware, getByProduct);

// เปรียบเทียบสเปคของสินค้า 2 ตัว (login แล้วเข้าถึงได้ทุก role)
router.post("/compare", authMiddleware, compare);

// แก้ไขสเปคสินค้า (เฉพาะ Admin/SuperAdmin)
router.put(
  "/product/:productId",
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  updateProductSpecs,
);

module.exports = router;
