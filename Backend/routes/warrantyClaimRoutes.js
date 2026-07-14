const express = require("express");
const router = express.Router();

const WarrantyController = require("../controllers/warrantyController");
const authMiddleware = require("../middlewares/authMiddleware");

// ส่งคำขอเคลมประกัน
router.post("/", authMiddleware, WarrantyController.createClaim);

// ดูคำขอเคลมของผู้ใช้งานที่ล็อกอิน
router.get("/my", authMiddleware, WarrantyController.getMyClaims);

// ดูรายละเอียดคำขอเคลม
router.get("/:id", authMiddleware, WarrantyController.getClaimById);

// ดูคำขอเคลมทั้งหมด
router.get("/", authMiddleware, WarrantyController.getAllClaims);

// อัปเดตสถานะคำขอเคลม
router.put("/:id/status", authMiddleware, WarrantyController.updateClaimStatus);

module.exports = router;
