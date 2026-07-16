const db = require("../config/db");

class CategoryModel {
  // ดึง Category ทั้งหมด
  static async getAllCategories() {
    const [rows] = await db.query(`
      SELECT *
      FROM categories
      ORDER BY category_id ASC
    `);

    return rows;
  }

  // ดึง Category ตาม ID
  static async getCategoryById(categoryId) {
    const [rows] = await db.query(
      `
      SELECT *
      FROM categories
      WHERE category_id = ?
      LIMIT 1
      `,
      [categoryId],
    );

    return rows[0];
  }

  // เพิ่ม Category
  static async createCategory(category) {
    const { category_name, description, status } = category;

    const [result] = await db.query(
      `
      INSERT INTO categories
      (category_name, description, status)
      VALUES (?, ?, ?)
      `,
      [category_name, description, status],
    );

    return result.insertId;
  }

  // แก้ไข Category
  static async updateCategory(categoryId, category) {
    const { category_name, description, status } = category;

    const [result] = await db.query(
      `
      UPDATE categories
      SET
        category_name = ?,
        description = ?,
        status = ?
      WHERE category_id = ?
      `,
      [category_name, description, status, categoryId],
    );

    return result.affectedRows;
  }

  // ลบ Category
  static async deleteCategory(categoryId) {
    const [result] = await db.query(
      `
      DELETE FROM categories
      WHERE category_id = ?
      `,
      [categoryId],
    );

    return result.affectedRows;
  }
}

module.exports = CategoryModel;
