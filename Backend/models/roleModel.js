const db = require("../config/db");

class RoleModel {
  // ดึง Role ทั้งหมด
  static async getAll() {
    const [rows] = await db.query("SELECT * FROM roles ORDER BY role_id ASC");

    return rows;
  }

  // หา Role จาก ID
  static async findById(roleId) {
    const [rows] = await db.query(
      "SELECT * FROM roles WHERE role_id = ? LIMIT 1",
      [roleId],
    );

    return rows[0];
  }

  // อัปเดตชื่อ Role
  static async updateName(roleId, roleName) {
    const [result] = await db.query(
      "UPDATE roles SET role_name = ? WHERE role_id = ?",
      [roleName, roleId],
    );

    return result.affectedRows > 0;
  }

  // ดึงผู้ใช้ทั้งหมดในระบบพร้อม Role ปัจจุบัน
  static async getAllUsersWithRoles() {
    const [rows] = await db.query(
      `SELECT u.user_id, u.first_name, u.last_name, u.email, u.status,
              u.role_id, r.role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.role_id
       ORDER BY u.user_id ASC`,
    );

    return rows;
  }

  // อัปเดต Role ของผู้ใช้
  static async updateUserRole(userId, roleId) {
    const [result] = await db.query(
      "UPDATE users SET role_id = ? WHERE user_id = ?",
      [roleId, userId],
    );

    return result.affectedRows > 0;
  }
}

module.exports = RoleModel;
