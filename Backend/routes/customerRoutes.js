const express = require("express");
const router = express.Router();

const CustomerController = require("../controllers/customerController");
const CustomerModel = require("../models/customerModel");
const authMiddleware = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/roleMiddleware");
const requirePagePermission = require("../middlewares/pagePermissionMiddleware");
const ROLES = require("../utils/roles");

const isAdmin = (req) =>
  req.user?.role_id === ROLES.ADMIN || req.user?.role_id === ROLES.SUPER_ADMIN;

// อนุญาตเฉพาะเจ้าของ record เองหรือ Admin/SuperAdmin
const requireSelfOrAdmin = (req, res, next) => {
  if (isAdmin(req) || String(req.user?.user_id) === String(req.params.id)) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Forbidden: insufficient permissions",
  });
};

// field "status" แก้ได้เฉพาะ Admin เท่านั้น — ถ้าลูกค้าทั่วไปส่งมา ให้แทนที่ด้วยค่าเดิม
// จาก DB เสมอ (ไม่ error แค่ไม่บันทึกค่าที่ส่งมา) เพราะ CustomerModel.updateCustomer
// เขียนทับทุกคอลัมน์ในคำสั่ง UPDATE เดียว จึงต้องส่งค่าที่ถูกต้องเข้าไปแทนการลบทิ้งเฉยๆ
const preserveStatusForNonAdmin = async (req, res, next) => {
  try {
    if (isAdmin(req)) {
      return next();
    }

    const existing = await CustomerModel.getCustomerById(req.params.id);
    req.body.status = existing?.status ?? null;

    next();
  } catch (error) {
    next(error);
  }
};

// ดูลูกค้าทั้งหมด (เฉพาะ Admin/SuperAdmin ที่มีสิทธิ์ "มองเห็น" หน้า Customers)
router.get(
  "/",
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  requirePagePermission("customers", "view"),
  CustomerController.getAllCustomers,
);

// ดูลูกค้าตาม ID (เจ้าของ record เองหรือ Admin/SuperAdmin ที่มีสิทธิ์ "มองเห็น")
// requirePagePermission จะข้ามการตรวจให้อัตโนมัติถ้าผู้เรียกเป็นเจ้าของ record เอง (role Customer)
router.get(
  "/:id",
  authMiddleware,
  requireSelfOrAdmin,
  requirePagePermission("customers", "view"),
  CustomerController.getCustomerById,
);

// แก้ไขข้อมูลลูกค้า (เจ้าของ record เองแก้ได้เสมอ, Admin ต้องมีสิทธิ์ "จัดการ")
router.put(
  "/:id",
  authMiddleware,
  requireSelfOrAdmin,
  requirePagePermission("customers", "manage"),
  preserveStatusForNonAdmin,
  CustomerController.updateCustomer,
);

// ลบลูกค้า (เฉพาะ Admin/SuperAdmin ที่มีสิทธิ์ "จัดการ")
router.delete(
  "/:id",
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  requirePagePermission("customers", "manage"),
  CustomerController.deleteCustomer,
);

// Order History ของลูกค้า
router.get(
  "/:id/orders",
  authMiddleware,
  requireSelfOrAdmin,
  requirePagePermission("customers", "view"),
  CustomerController.getCustomerOrders,
);

// Statistics ของลูกค้า
router.get(
  "/:id/statistics",
  authMiddleware,
  requireSelfOrAdmin,
  requirePagePermission("customers", "view"),
  CustomerController.getCustomerStatistics,
);

module.exports = router;
