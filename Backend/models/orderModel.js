const db = require("../config/db");

class OrderModel {
  // ดึงออเดอร์ทั้งหมด
  static async getAllOrders() {
    const [rows] = await db.query(`
      SELECT
        o.order_id,
        o.order_number,
        CONCAT(u.first_name, ' ', u.last_name) AS full_name,
        o.shipping_name,
        o.total_amount,
        o.order_status,
        o.order_date
      FROM orders o
      LEFT JOIN users u
        ON o.user_id = u.user_id
      ORDER BY o.order_date DESC
    `);

    return rows;
  }

  // ดึงรายละเอียดออเดอร์
  static async getOrderById(id) {
    const [order] = await db.query(
      `
      SELECT
  o.*,
  CONCAT(u.first_name, ' ', u.last_name) AS full_name,
  u.email,

  p.payment_method,
  p.payment_status,
  p.transaction_id,
  p.paid_at

FROM orders o

LEFT JOIN users u
  ON o.user_id = u.user_id

LEFT JOIN payments p
  ON o.order_id = p.order_id

WHERE o.order_id = ?
      `,
      [id],
    );

    if (order.length === 0) return null;

    const [items] = await db.query(
      `
      SELECT
        oi.*,
        p.product_name
      FROM order_items oi
      LEFT JOIN products p
        ON oi.product_id = p.product_id
      WHERE oi.order_id = ?
      `,
      [id],
    );

    return {
      order: order[0],
      items,
    };
  }

  // อัปเดตสถานะออเดอร์
  static async updateOrderStatus(id, status) {
    const [result] = await db.query(
      `
      UPDATE orders
      SET order_status = ?
      WHERE order_id = ?
      `,
      [status, id],
    );

    return result;
  }

  // ลบออเดอร์
  static async deleteOrder(id) {
    // ลบรายการสินค้าในออเดอร์ก่อน
    await db.query("DELETE FROM order_items WHERE order_id = ?", [id]);

    const [result] = await db.query("DELETE FROM orders WHERE order_id = ?", [
      id,
    ]);

    return result;
  }

  // สร้างออเดอร์จากตะกร้าของลูกค้า
  static async createOrder(userId, addressId) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [cartRows] = await connection.query(
        `SELECT cart_id FROM shopping_carts WHERE user_id = ? LIMIT 1 FOR UPDATE`,
        [userId],
      );

      if (cartRows.length === 0) {
        await connection.rollback();
        return { success: false, error: "Cart not found" };
      }

      const cartId = cartRows[0].cart_id;

      const [cartItems] = await connection.query(
        `
        SELECT
          ci.product_id,
          ci.quantity,
          ci.subtotal,
          p.product_name,
          p.price
        FROM cart_items ci
        LEFT JOIN products p
          ON ci.product_id = p.product_id
        WHERE ci.cart_id = ?
        `,
        [cartId],
      );

      if (cartItems.length === 0) {
        await connection.rollback();
        return { success: false, error: "Cart is empty" };
      }

      const [addressRows] = await connection.query(
        `
        SELECT
          address_id,
          recipient_name,
          phone,
          address_line,
          subdistrict,
          district,
          province,
          postal_code
        FROM addresses
        WHERE address_id = ? AND user_id = ?
        LIMIT 1
        `,
        [addressId, userId],
      );

      if (addressRows.length === 0) {
        await connection.rollback();
        return { success: false, error: "Address not found" };
      }

      const address = addressRows[0];
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + Number(item.subtotal || 0),
        0,
      );
      const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const [orderResult] = await connection.query(
        `
        INSERT INTO orders (
          order_number,
          user_id,
          address_id,
          shipping_name,
          shipping_phone,
          shipping_address,
          shipping_subdistrict,
          shipping_district,
          shipping_province,
          shipping_postal_code,
          total_amount,
          order_status,
          order_date
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `,
        [
          orderNumber,
          userId,
          address.address_id,
          address.recipient_name,
          address.phone,
          address.address_line,
          address.subdistrict,
          address.district,
          address.province,
          address.postal_code,
          totalAmount,
          "PENDING",
        ],
      );

      const orderId = orderResult.insertId;

      for (const item of cartItems) {
        await connection.query(
          `
          INSERT INTO order_items (
            order_id,
            product_id,
            quantity,
            unit_price,
            subtotal
          )
          VALUES (?, ?, ?, ?, ?)
          `,
          [
            orderId,
            item.product_id,
            item.quantity,
            Number(item.price || 0),
            Number(item.subtotal || 0),
          ],
        );
      }

      await connection.commit();

      return {
        success: true,
        orderId,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // ดึงออเดอร์ของผู้ใช้งานที่ล็อกอิน
  static async getOrdersByUserId(userId) {
    const [rows] = await db.query(
      `
      SELECT
        order_id,
        order_number,
        user_id,
        address_id,
        shipping_name,
        shipping_phone,
        shipping_address,
        shipping_subdistrict,
        shipping_district,
        shipping_province,
        shipping_postal_code,
        total_amount,
        order_status,
        order_date
      FROM orders
      WHERE user_id = ?
      ORDER BY order_date DESC
      `,
      [userId],
    );

    return rows;
  }
}

module.exports = OrderModel;
