const db = require("../config/db");

class BrandModel {
  // ดึง Brand ตาม Category
  static async getBrandsByCategory(categoryId) {
    const [rows] = await db.query(
      `
      SELECT *
      FROM brands
      WHERE status = 'ACTIVE'
      AND category_id = ?
      ORDER BY brand_name
      `,
      [categoryId], // <-- ขาดตัวนี้
    );

    return rows;
  }

  // ดึง Brand ตาม ID
  static async getBrandById(id) {
    const [rows] = await db.query(
      `
      SELECT *
      FROM brands
      WHERE brand_id = ?
      `,
      [id],
    );

    return rows[0];
  }
}

module.exports = BrandModel;
