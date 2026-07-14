const db = require("../config/db");

class ReportModel {
  // Dashboard Summary
  static async getDashboardSummary() {
    const [[users]] = await db.query(
      "SELECT COUNT(*) AS total_users FROM users",
    );

    const [[products]] = await db.query(
      "SELECT COUNT(*) AS total_products FROM products",
    );

    const [[orders]] = await db.query(
      "SELECT COUNT(*) AS total_orders FROM orders",
    );

    const [[payments]] = await db.query(
      "SELECT COUNT(*) AS total_payments FROM payments",
    );

    const [[revenue]] = await db.query(`
      SELECT
        IFNULL(SUM(amount),0) AS total_revenue
      FROM payments
      WHERE payment_status='SUCCESS'
    `);

    return {
      total_users: users.total_users,
      total_products: products.total_products,
      total_orders: orders.total_orders,
      total_payments: payments.total_payments,
      total_revenue: revenue.total_revenue,
    };
  }

  // Recent Orders
  static async getRecentOrders() {
    const [rows] = await db.query(`
      SELECT
        order_id,
        order_number,
        shipping_name,
        total_amount,
        order_status,
        order_date
      FROM orders
      ORDER BY order_date DESC
      LIMIT 5
    `);

    return rows;
  }
}

module.exports = ReportModel;
