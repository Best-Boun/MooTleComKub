const db = require("../config/db");

class ProductModel {
  // ดึงสินค้าทั้งหมด
  static async getAllProducts() {
    const [rows] = await db.query(`
      SELECT
        p.*,
        c.category_name,
        b.brand_name
      FROM products p
      LEFT JOIN categories c
        ON p.category_id = c.category_id
      LEFT JOIN brands b
        ON p.brand_id = b.brand_id
      ORDER BY p.product_id DESC
    `);

    return rows;
  }

  // ดึง spec (dynamic) ของสินค้า 1 ชิ้น
  static async getSpecsByProductId(productId) {
    const [rows] = await db.query(
      `SELECT spec_name, spec_value FROM product_specs WHERE product_id = ? ORDER BY spec_id`,
      [productId],
    );

    return rows;
  }

  // ดึงสินค้าตาม ID (แนบ specs ไปด้วย)
  static async getProductById(id) {
    const [rows] = await db.query(
      `
      SELECT
        p.*,
        c.category_name,
        b.brand_name
      FROM products p
      LEFT JOIN categories c
        ON p.category_id = c.category_id
      LEFT JOIN brands b
        ON p.brand_id = b.brand_id
      WHERE p.product_id = ?
      `,
      [id],
    );

    const product = rows[0];
    if (!product) return null;

    product.specs = await ProductModel.getSpecsByProductId(product.product_id);
    return product;
  }

  // ดึงสินค้าตาม SKU (สำหรับเช็ค SKU ซ้ำตอนกรอกฟอร์ม)
  static async getProductBySku(sku) {
    const [rows] = await db.query(
      `
      SELECT
        p.*,
        c.category_name,
        b.brand_name
      FROM products p
      LEFT JOIN categories c
        ON p.category_id = c.category_id
      LEFT JOIN brands b
        ON p.brand_id = b.brand_id
      WHERE p.sku = ?
      LIMIT 1
      `,
      [sku],
    );

    const product = rows[0];
    if (!product) return null;

    product.specs = await ProductModel.getSpecsByProductId(product.product_id);
    return product;
  }

  // ลบ spec เดิมทั้งหมดแล้วเขียนชุดใหม่ (ใช้ connection เดียวกับ transaction ของ create/update)
  static async saveSpecs(connection, productId, specs) {
    await connection.query(`DELETE FROM product_specs WHERE product_id = ?`, [
      productId,
    ]);

    const entries = Object.entries(specs || {}).filter(
      ([, value]) =>
        value !== undefined && value !== null && String(value).trim() !== "",
    );

    if (entries.length === 0) return;

    const values = entries.map(([specName, specValue]) => [
      productId,
      specName,
      specValue,
    ]);

    await connection.query(
      `INSERT INTO product_specs (product_id, spec_name, spec_value) VALUES ?`,
      [values],
    );
  }

  // เพิ่มสินค้า + specs (transaction เดียวกัน)
  static async createProduct(product) {
    const {
      category_id,
      brand_id,
      sku,
      image,
      product_name,
      description,
      price,
      stock,
      warranty_provider,
      status,
      specs,
    } = product;

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        `
        INSERT INTO products
          (category_id, brand_id, sku, image, product_name, description, price, stock, warranty_provider, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          category_id,
          brand_id,
          sku,
          image,
          product_name,
          description,
          price,
          stock,
          warranty_provider,
          status,
        ],
      );

      const productId = result.insertId;
      await ProductModel.saveSpecs(connection, productId, specs);

      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // แก้ไขสินค้า + specs (transaction เดียวกัน)
  static async updateProduct(id, product) {
    const {
      category_id,
      brand_id,
      sku,
      image,
      product_name,
      description,
      price,
      stock,
      warranty_provider,
      status,
      specs,
    } = product;

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        `
        UPDATE products
        SET
          category_id = ?,
          brand_id = ?,
          sku = ?,
          image = ?,
          product_name = ?,
          description = ?,
          price = ?,
          stock = ?,
          warranty_provider = ?,
          status = ?
        WHERE product_id = ?
        `,
        [
          category_id,
          brand_id,
          sku,
          image,
          product_name,
          description,
          price,
          stock,
          warranty_provider,
          status,
          id,
        ],
      );

      await ProductModel.saveSpecs(connection, id, specs);

      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // ลบสินค้า (product_specs ถูกลบตาม FK cascade อัตโนมัติ)
  static async deleteProduct(id) {
    const [result] = await db.query(
      "DELETE FROM products WHERE product_id = ?",
      [id],
    );

    return result;
  }

  static async getActiveProducts() {
    const [rows] = await db.query(`
    SELECT
      p.*,
      c.category_name,
      b.brand_name
    FROM products p
    LEFT JOIN categories c
      ON p.category_id = c.category_id
    LEFT JOIN brands b
      ON p.brand_id = b.brand_id
    WHERE p.status = 'ACTIVE'
    ORDER BY p.product_id DESC
  `);

    return rows;
  }
}

module.exports = ProductModel;