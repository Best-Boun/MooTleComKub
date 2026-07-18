const db = require("../config/db");

class SpecTemplateModel {
  // ดึงชื่อ field สเปคทั้งหมดที่กำหนดไว้สำหรับ category หนึ่ง
  static async getSpecNamesByCategory(categoryId) {
    const [rows] = await db.query(
      `
      SELECT spec_name
      FROM spec_templates
      WHERE category_id = ?
      ORDER BY template_id ASC
      `,
      [categoryId],
    );

    return rows.map((r) => r.spec_name);
  }
}

module.exports = SpecTemplateModel;
