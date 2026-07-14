const express = require("express");
const router = express.Router();

const OrderController = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");

// สร้างออเดอร์จากตะกร้าของลูกค้า
router.post("/", authMiddleware, OrderController.createOrder);

// ดูออเดอร์ของผู้ใช้งานที่ล็อกอิน
router.get("/my", authMiddleware, OrderController.getMyOrders);

// ดูออเดอร์ทั้งหมด
router.get("/", OrderController.getAllOrders);

// ดูรายละเอียดออเดอร์
router.get("/:id", authMiddleware, OrderController.getOrderById);

// อัปเดตสถานะออเดอร์
router.put("/:id/status", OrderController.updateOrderStatus);

// ลบออเดอร์
router.delete("/:id", OrderController.deleteOrder);

module.exports = router;
