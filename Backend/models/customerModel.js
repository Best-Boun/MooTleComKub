const db = require("../config/db");

class CustomerModel {
  // ดึงลูกค้าทั้งหมด
  static async getAllCustomers() {
    const [rows] = await db.query(`
      SELECT
        user_id,
        role_id,
        first_name,
        last_name,
        email,
        phone,
        status,
        created_at
      FROM users
      ORDER BY created_at DESC
    `);

    return rows;
  }

  // ดึงลูกค้าตาม ID
  static async getCustomerById(id) {
    const [rows] = await db.query(
      `
      SELECT
        user_id,
        role_id,
        first_name,
        last_name,
        email,
        phone,
        status,
        created_at
      FROM users
      WHERE user_id = ?
      `,
      [id],
    );

    return rows[0];
  }

  // แก้ไขข้อมูลลูกค้า
  static async updateCustomer(id, customer) {
    const { first_name, last_name, email, phone, status } = customer;

    const [result] = await db.query(
      `
      UPDATE users
      SET
        first_name = ?,
        last_name = ?,
        email = ?,
        phone = ?,
        status = ?
      WHERE user_id = ?
      `,
      [first_name, last_name, email, phone, status, id],
    );

    return result;
  }

  // ลบลูกค้า
  static async deleteCustomer(id) {
    const [result] = await db.query("DELETE FROM users WHERE user_id = ?", [
      id,
    ]);

    return result;
  }

  // ดึงออเดอร์ของลูกค้า
  static async getCustomerOrders(userId) {
    const [rows] = await db.query(
      `
    SELECT
      order_id,
      order_number,
      total_amount,
      order_status,
      order_date
    FROM orders
    WHERE user_id = ?
    ORDER BY order_date DESC
    `,
      [userId],
    );

    return rows;
  }

  // สถิติของลูกค้า
  static async getCustomerStatistics(userId) {
    const [[stats]] = await db.query(
      `
    SELECT
      COUNT(*) AS total_orders,
      IFNULL(SUM(total_amount),0) AS total_spending,
      (
        SELECT COUNT(*)
        FROM warranty_claims
        WHERE user_id = ?
      ) AS total_claims
    FROM orders
    WHERE user_id = ?
    `,
      [userId, userId],
    );

    return stats;
  }
}

module.exports = CustomerModel;
