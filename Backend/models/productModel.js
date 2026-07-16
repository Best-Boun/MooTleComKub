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

  // ดึงสินค้าตาม ID
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

    return rows[0];
  }

  // เพิ่มสินค้า
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
    } = product;

    const [result] = await db.query(
      `
      INSERT INTO products
(
  category_id,
  brand_id,
  sku,
  image,
  product_name,
  description,
  price,
  stock,
  warranty_provider,
  status
)
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

    return result;
  }

  // แก้ไขสินค้า
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
    } = product;

    const [result] = await db.query(
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

    return result;
  }

  // ลบสินค้า
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
