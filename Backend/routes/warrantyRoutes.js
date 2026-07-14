const express = require("express");
const router = express.Router();

const WarrantyController = require("../controllers/warrantyController");
const authMiddleware = require("../middlewares/authMiddleware");

// ดูประกันของผู้ใช้งานที่ล็อกอิน
router.get("/", authMiddleware, WarrantyController.getMyWarranties);

// ดูรายละเอียดประกัน
router.get("/:id", authMiddleware, WarrantyController.getWarrantyById);

module.exports = router;
