const express = require("express");
const router = express.Router();

const OrderController = require("../controllers/orderController");

// ดูออเดอร์ทั้งหมด
router.get("/", OrderController.getAllOrders);

// ดูรายละเอียดออเดอร์
router.get("/:id", OrderController.getOrderById);

// อัปเดตสถานะออเดอร์
router.put("/:id/status", OrderController.updateOrderStatus);

// ลบออเดอร์
router.delete("/:id", OrderController.deleteOrder);

module.exports = router;
