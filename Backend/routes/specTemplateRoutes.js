const express = require("express");
const router = express.Router();

const {
  getByCategory,
  getAll,
  create,
  remove,
} = require("../controllers/specTemplateController");

const authMiddleware = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/roleMiddleware");
const ROLES = require("../utils/roles");

// ดึง template ตาม category (login แล้วเข้าถึงได้ทุก role — ใช้ตอน Compare ด้วย)
router.get("/categories/:categoryId", authMiddleware, getByCategory);

// ดึง template ทั้งหมด (เฉพาะ SuperAdmin)
router.get("/", authMiddleware, requireRole(ROLES.SUPER_ADMIN), getAll);

// สร้าง template ใหม่ (เฉพาะ SuperAdmin)
router.post("/", authMiddleware, requireRole(ROLES.SUPER_ADMIN), create);

// ลบ template (เฉพาะ SuperAdmin)
router.delete("/:id", authMiddleware, requireRole(ROLES.SUPER_ADMIN), remove);

module.exports = router;
