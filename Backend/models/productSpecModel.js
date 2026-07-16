const db = require("../config/db");

class ProductSpecModel {
  // ดึงสเปคทั้งหมดของสินค้าหนึ่งตัว
  static async getByProductId(productId) {
    const [rows] = await db.query(
      `
      SELECT *
      FROM product_specs
      WHERE product_id = ?
      ORDER BY spec_id ASC
      `,
      [productId],
    );

    return rows;
  }

  // ดึงสเปคของสินค้าหลายตัวพร้อมกัน (สำหรับหน้า Compare)
  static async getByProductIds(productIds) {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return [];
    }

    const [rows] = await db.query(
      `
      SELECT *
      FROM product_specs
      WHERE product_id IN (?)
      ORDER BY product_id ASC, spec_id ASC
      `,
      [productIds],
    );

    return rows;
  }

  // แทนที่สเปคทั้งชุดของสินค้า 1 ตัว (ลบของเดิมทั้งหมดแล้ว insert ใหม่)
  static async upsertMany(productId, specsArray) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      await connection.query(`DELETE FROM product_specs WHERE product_id = ?`, [
        productId,
      ]);

      for (const spec of specsArray) {
        await connection.query(
          `INSERT INTO product_specs (product_id, spec_name, spec_value) VALUES (?, ?, ?)`,
          [productId, spec.specName, spec.specValue],
        );
      }

      await connection.commit();

      return { success: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = ProductSpecModel;
