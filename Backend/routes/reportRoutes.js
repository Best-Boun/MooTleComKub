const express = require("express");
const router = express.Router();

const ReportController = require("../controllers/reportController");
const authMiddleware = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/roleMiddleware");
const requirePagePermission = require("../middlewares/pagePermissionMiddleware");
const ROLES = require("../utils/roles");

// Dashboard Summary — หน้า Dashboard ของแอดมิน ต้องมีสิทธิ์ "มองเห็น"
router.get(
  "/dashboard",
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  requirePagePermission("dashboard", "view"),
  ReportController.getDashboardSummary,
);

// Recent Orders — เป็นส่วนหนึ่งของหน้า Dashboard เช่นกัน
router.get(
  "/recent-orders",
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  requirePagePermission("dashboard", "view"),
  ReportController.getRecentOrders,
);

module.exports = router;
