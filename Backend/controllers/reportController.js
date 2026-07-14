const ReportModel = require("../models/reportModel");

class ReportController {
  // Dashboard Summary
  static async getDashboardSummary(req, res) {
    try {
      const summary = await ReportModel.getDashboardSummary();

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard summary",
      });
    }
  }

  // Recent Orders
  static async getRecentOrders(req, res) {
    try {
      const orders = await ReportModel.getRecentOrders();

      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch recent orders",
      });
    }
  }
}

module.exports = ReportController;
