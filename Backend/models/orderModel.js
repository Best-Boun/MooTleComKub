const db = require("../config/db");

class OrderModel {
  // ดึงออเดอร์ทั้งหมด
  static async getAllOrders() {
    const [rows] = await db.query(`
      SELECT
        o.order_id,
        o.order_number,
        CONCAT(u.first_name, ' ', u.last_name) AS full_name,
        o.shipping_name,
        o.total_amount,
        o.order_status,
        o.order_date
      FROM orders o
      LEFT JOIN users u
        ON o.user_id = u.user_id
      ORDER BY o.order_date DESC
    `);

    return rows;
  }

  // ดึงรายละเอียดออเดอร์
  static async getOrderById(id) {
    const [order] = await db.query(
      `
      SELECT
        o.*,
        CONCAT(u.first_name, ' ', u.last_name) AS full_name,
        u.email
      FROM orders o
      LEFT JOIN users u
        ON o.user_id = u.user_id
      WHERE o.order_id = ?
      `,
      [id],
    );

    if (order.length === 0) return null;

    const [items] = await db.query(
      `
      SELECT
        oi.*,
        p.product_name
      FROM order_items oi
      LEFT JOIN products p
        ON oi.product_id = p.product_id
      WHERE oi.order_id = ?
      `,
      [id],
    );

    return {
      order: order[0],
      items,
    };
  }

  // อัปเดตสถานะออเดอร์
  static async updateOrderStatus(id, status) {
    const [result] = await db.query(
      `
      UPDATE orders
      SET order_status = ?
      WHERE order_id = ?
      `,
      [status, id],
    );

    return result;
  }

  // ลบออเดอร์
  static async deleteOrder(id) {
    // ลบรายการสินค้าในออเดอร์ก่อน
    await db.query("DELETE FROM order_items WHERE order_id = ?", [id]);

    const [result] = await db.query("DELETE FROM orders WHERE order_id = ?", [
      id,
    ]);

    return result;
  }
}

module.exports = OrderModel;
