const db = require("../config/db");

class SystemLogModel {
  // ดึง System Logs (แบ่งหน้า)
  static async getAll({ limit = 100, offset = 0 } = {}) {
    const [rows] = await db.query(
      `SELECT l.log_id, l.user_id, u.first_name, u.last_name,
              l.action, l.description, l.ip_address, l.created_at
       FROM system_logs l
       LEFT JOIN users u ON u.user_id = l.user_id
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    return rows;
  }

  // บันทึก Log ใหม่
  static async create({ user_id, action, description, ip_address }) {
    const [result] = await db.query(
      `INSERT INTO system_logs (user_id, action, description, ip_address)
       VALUES (?, ?, ?, ?)`,
      [user_id || null, action, description || null, ip_address || null],
    );

    return result.insertId;
  }
}

module.exports = SystemLogModel;
