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
}

module.exports = RoleModel;
