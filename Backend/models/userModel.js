const db = require("../config/db");

class UserModel {
  // หา User จาก Email
  static async findByEmail(email) {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email],
    );

    return rows[0];
  }

  // หา User จาก ID
  static async findById(userId) {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE user_id = ? LIMIT 1",
      [userId],
    );

    return rows[0];
  }

  // สร้าง User ใหม่
  static async createUser(user) {
    const { role_id, first_name, last_name, email, password_hash, phone } =
      user;

    const [result] = await db.query(
      `INSERT INTO users
            (role_id, first_name, last_name, email, password_hash, phone)
            VALUES (?, ?, ?, ?, ?, ?)`,
      [role_id, first_name, last_name, email, password_hash, phone],
    );

    return result.insertId;
  }
}

module.exports = UserModel;
