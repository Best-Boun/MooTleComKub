const express = require("express");

const router = express.Router();

const {
  getPermissionsMatrix,
  updatePermissions,
  getMyPermissions,
} = require("../controllers/adminPermissionController");

const authMiddleware = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/roleMiddleware");
const ROLES = require("../utils/roles");

// ทุกคนที่ Login แล้ว (Admin/SuperAdmin) เรียกดูสิทธิ์ของตัวเองได้
// ต้องประกาศก่อน router.use(requireRole(SUPER_ADMIN)) ด้านล่าง ไม่งั้น Admin จะเรียกไม่ได้
router.get("/me", authMiddleware, getMyPermissions);

// ที่เหลือทั้งหมดเฉพาะ SuperAdmin เท่านั้น
router.use(authMiddleware, requireRole(ROLES.SUPER_ADMIN));

// ดึงตาราง Admin ทุกคนพร้อมสิทธิ์ทุกหน้า
router.get("/", getPermissionsMatrix);

// บันทึกสิทธิ์ของ Admin คนเดียว
router.put("/:userId", updatePermissions);

module.exports = router;
