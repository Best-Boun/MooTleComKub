const express = require("express");
const router = express.Router();

const WarrantyController = require("../controllers/warrantyController");
const authMiddleware = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/roleMiddleware");
const ROLES = require("../utils/roles");

// ส่งคำขอเคลมประกัน
router.post("/", authMiddleware, WarrantyController.createClaim);

// ดูคำขอเคลมของผู้ใช้งานที่ล็อกอิน
router.get("/my", authMiddleware, WarrantyController.getMyClaims);

// ดูรายละเอียดคำขอเคลม
router.get("/:id", authMiddleware, WarrantyController.getClaimById);

// ดูคำขอเคลมทั้งหมด (เฉพาะ Admin/SuperAdmin)
router.get(
  "/",
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  WarrantyController.getAllClaims,
);

// อัปเดตสถานะคำขอเคลม (เฉพาะ Admin/SuperAdmin)
router.put(
  "/:id/status",
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  WarrantyController.updateClaimStatus,
);

module.exports = router;
