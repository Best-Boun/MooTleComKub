const db = require("../config/db");
const ROLES = require("../utils/roles");

class AdminModel {
  // ดึงรายชื่อ Admin ทั้งหมด
  static async getAll() {
    const [rows] = await db.query(
      `SELECT user_id, first_name, last_name, email, phone, status, role_id, created_at
       FROM users
       WHERE role_id = ?
       ORDER BY user_id DESC`,
      [ROLES.ADMIN],
    );

    return rows;
  }

  // หา Admin จาก ID
  static async findById(userId) {
    const [rows] = await db.query(
      `SELECT user_id, first_name, last_name, email, phone, status, role_id, created_at
       FROM users
       WHERE user_id = ? AND role_id = ?
       LIMIT 1`,
      [userId, ROLES.ADMIN],
    );

    return rows[0];
  }

  // สร้าง Admin ใหม่
  static async create({ first_name, last_name, email, password_hash, phone }) {
    const [result] = await db.query(
      `INSERT INTO users
        (role_id, first_name, last_name, email, password_hash, phone, status)
       VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      [ROLES.ADMIN, first_name, last_name, email, password_hash, phone || null],
    );

    return result.insertId;
  }

  // อัปเดตข้อมูล Admin
  static async update(userId, fields) {
    const allowedFields = ["first_name", "last_name", "email", "phone", "status"];
    const updates = [];
    const values = [];

    for (const key of allowedFields) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }

    if (updates.length === 0) {
      return false;
    }

    values.push(userId, ROLES.ADMIN);

    const [result] = await db.query(
      `UPDATE users SET ${updates.join(", ")} WHERE user_id = ? AND role_id = ?`,
      values,
    );

    return result.affectedRows > 0;
  }

  // ลบ Admin
  static async remove(userId) {
    const [result] = await db.query(
      "DELETE FROM users WHERE user_id = ? AND role_id = ?",
      [userId, ROLES.ADMIN],
    );

    return result.affectedRows > 0;
  }
}

module.exports = AdminModel;
