const db = require("../config/db");

class SpecTemplateModel {
  // ดึง spec template ทั้งหมดของ category หนึ่ง
  static async getAllByCategory(categoryId) {
    const [rows] = await db.query(
      `
      SELECT *
      FROM spec_templates
      WHERE category_id = ?
      ORDER BY template_id ASC
      `,
      [categoryId],
    );

    return rows;
  }

  // ดึง spec template ทั้งหมดทุก category (สำหรับหน้า SuperAdmin จัดการ)
  static async getAll() {
    const [rows] = await db.query(`
      SELECT
        st.*,
        c.category_name
      FROM spec_templates st
      LEFT JOIN categories c
        ON st.category_id = c.category_id
      ORDER BY st.category_id ASC, st.template_id ASC
    `);

    return rows;
  }

  // สร้าง spec template ใหม่
  static async create(categoryId, specName) {
    try {
      const [result] = await db.query(
        `INSERT INTO spec_templates (category_id, spec_name) VALUES (?, ?)`,
        [categoryId, specName],
      );

      return { success: true, templateId: result.insertId };
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return {
          success: false,
          error: "This spec already exists for the selected category",
        };
      }

      if (error.code === "ER_NO_REFERENCED_ROW_2" || error.code === "ER_NO_REFERENCED_ROW") {
        return { success: false, error: "Category not found" };
      }

      throw error;
    }
  }

  // ลบ spec template
  static async delete(templateId) {
    const [result] = await db.query(
      `DELETE FROM spec_templates WHERE template_id = ?`,
      [templateId],
    );

    return result.affectedRows;
  }
}

module.exports = SpecTemplateModel;
