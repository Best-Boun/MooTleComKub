const express = require("express");
const router = express.Router();

const ReportController = require("../controllers/reportController");

// Dashboard Summary
router.get("/dashboard", ReportController.getDashboardSummary);

// Recent Orders
router.get("/recent-orders", ReportController.getRecentOrders);

module.exports = router;
