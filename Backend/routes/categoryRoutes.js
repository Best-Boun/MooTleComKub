const express = require("express");

const router = express.Router();

const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const authMiddleware = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/roleMiddleware");
const requirePagePermission = require("../middlewares/pagePermissionMiddleware");
const ROLES = require("../utils/roles");

// GET ทั้งหมด — เปิดให้ทุกคนที่ Login แล้วดูได้ (ใช้ทั้งฝั่งลูกค้าและฝั่งแอดมิน
// เช่น dropdown เลือกหมวดหมู่ในหน้า Products) จึงไม่ผูกกับสิทธิ์ "มองเห็นหน้า Categories"
router.get("/", getAllCategories);

// GET ตาม ID
router.get("/:id", getCategoryById);

// POST — ต้องเป็น Admin/SuperAdmin และมีสิทธิ์ "จัดการ" หน้า Categories
router.post(
  "/",
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  requirePagePermission("categories", "manage"),
  createCategory,
);

// PUT
router.put(
  "/:id",
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  requirePagePermission("categories", "manage"),
  updateCategory,
);

// DELETE
router.delete(
  "/:id",
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  requirePagePermission("categories", "manage"),
  deleteCategory,
);

module.exports = router;
