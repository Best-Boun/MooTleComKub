const express = require("express");
const router = express.Router();

const OrderController = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/roleMiddleware");
const requirePagePermission = require("../middlewares/pagePermissionMiddleware");
const ROLES = require("../utils/roles");

// สร้างออเดอร์จากตะกร้าของลูกค้า (Customer ใช้ตอน Checkout)
router.post("/", authMiddleware, OrderController.createOrder);

// ดูออเดอร์ของผู้ใช้งานที่ล็อกอิน (Customer ดูออเดอร์ตัวเอง)
router.get("/my", authMiddleware, OrderController.getMyOrders);

// ดูออเดอร์ทั้งหมด — หน้า Admin Orders เท่านั้น
router.get(
  "/",
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  requirePagePermission("orders", "view"),
  OrderController.getAllOrders,
);

// ดูรายละเอียดออเดอร์ — ใช้ร่วมกันทั้ง Customer (เจ้าของออเดอร์) และ Admin
// requirePagePermission จะข้ามการตรวจให้ถ้าไม่ใช่ role Admin (Customer ผ่านได้ตามปกติ)
// ส่วนความเป็นเจ้าของออเดอร์ถูกตรวจอยู่แล้วใน OrderController.getOrderById
router.get(
  "/:id",
  authMiddleware,
  requirePagePermission("orders", "view"),
  OrderController.getOrderById,
);

// อัปเดตสถานะออเดอร์ — Admin/SuperAdmin ที่มีสิทธิ์ "จัดการ" หน้า Orders เท่านั้น
router.put(
  "/:id/status",
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  requirePagePermission("orders", "manage"),
  OrderController.updateOrderStatus,
);

// ลบออเดอร์ — Admin/SuperAdmin ที่มีสิทธิ์ "จัดการ" หน้า Orders เท่านั้น
router.delete(
  "/:id",
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  requirePagePermission("orders", "manage"),
  OrderController.deleteOrder,
);

module.exports = router;
