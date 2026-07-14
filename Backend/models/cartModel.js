const db = require("../config/db");

class CartModel {
  // Get user's cart with items and product details
  static async getCartByUserId(userId) {
    const [rows] = await db.query(
      `SELECT 
        c.cart_id,
        c.user_id,
        c.total_amount,
        c.created_at,
        c.updated_at,
        COALESCE(
          JSON_ARRAYAGG(
            CASE WHEN ci.cart_item_id IS NOT NULL THEN
              JSON_OBJECT(
                'cart_item_id', ci.cart_item_id,
                'product_id', ci.product_id,
                'quantity', ci.quantity,
                'subtotal', ci.subtotal,
                'price', p.price,
                'stock', p.stock,
                'status', p.status
              )
            END
          ),
          JSON_ARRAY()
        ) as items
      FROM shopping_carts c
      LEFT JOIN cart_items ci ON c.cart_id = ci.cart_id
      LEFT JOIN products p ON ci.product_id = p.product_id
      WHERE c.user_id = ?
      GROUP BY c.cart_id`,
      [userId],
    );

    return rows[0] || null;
  }

  // Check if cart exists for user
  static async findCartByUserId(userId) {
    const [rows] = await db.query(
      `SELECT cart_id FROM shopping_carts WHERE user_id = ? LIMIT 1`,
      [userId],
    );

    return rows[0];
  }

  // Create new cart for user
  static async createCart(userId) {
    const [result] = await db.query(
      `INSERT INTO shopping_carts (user_id, total_amount) VALUES (?, 0)`,
      [userId],
    );

    return result.insertId;
  }

  // Get cart item by id
  static async getCartItem(cartItemId) {
    const [rows] = await db.query(
      `SELECT ci.cart_item_id, ci.cart_id, ci.product_id, ci.quantity, ci.subtotal, p.price, p.stock, p.status
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.product_id
       WHERE ci.cart_item_id = ?
       LIMIT 1`,
      [cartItemId],
    );

    return rows[0];
  }

  // Get existing cart item by cart_id and product_id
  static async findCartItemByProductId(cartId, productId) {
    const [rows] = await db.query(
      `SELECT cart_item_id, quantity, subtotal FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1`,
      [cartId, productId],
    );

    return rows[0];
  }

  // Add or update item in cart
  static async addCartItem(cartId, productId, quantity, price) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const existingItem = await this.findCartItemByProductId(cartId, productId);

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        const newSubtotal = newQuantity * price;

        await connection.query(
          `UPDATE cart_items SET quantity = ?, subtotal = ? WHERE cart_item_id = ?`,
          [newQuantity, newSubtotal, existingItem.cart_item_id],
        );
      } else {
        const subtotal = quantity * price;

        await connection.query(
          `INSERT INTO cart_items (cart_id, product_id, quantity, subtotal) VALUES (?, ?, ?, ?)`,
          [cartId, productId, quantity, subtotal],
        );
      }

      // Recalculate cart total
      const [[{ totalAmount }]] = await connection.query(
        `SELECT SUM(subtotal) as totalAmount FROM cart_items WHERE cart_id = ?`,
        [cartId],
      );

      await connection.query(
        `UPDATE shopping_carts SET total_amount = ? WHERE cart_id = ?`,
        [totalAmount || 0, cartId],
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Update cart item quantity
  static async updateCartItem(cartItemId, newQuantity, price) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [[cartItem]] = await connection.query(
        `SELECT cart_id FROM cart_items WHERE cart_item_id = ? LIMIT 1`,
        [cartItemId],
      );

      if (!cartItem) {
        await connection.rollback();
        return null;
      }

      const cartId = cartItem.cart_id;
      const newSubtotal = newQuantity * price;

      await connection.query(
        `UPDATE cart_items SET quantity = ?, subtotal = ? WHERE cart_item_id = ?`,
        [newQuantity, newSubtotal, cartItemId],
      );

      // Recalculate cart total
      const [[{ totalAmount }]] = await connection.query(
        `SELECT SUM(subtotal) as totalAmount FROM cart_items WHERE cart_id = ?`,
        [cartId],
      );

      await connection.query(
        `UPDATE shopping_carts SET total_amount = ? WHERE cart_id = ?`,
        [totalAmount || 0, cartId],
      );

      await connection.commit();
      return this.getCartItem(cartItemId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Remove cart item
  static async removeCartItem(cartItemId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [[cartItem]] = await connection.query(
        `SELECT cart_id FROM cart_items WHERE cart_item_id = ? LIMIT 1`,
        [cartItemId],
      );

      if (!cartItem) {
        await connection.rollback();
        return false;
      }

      const cartId = cartItem.cart_id;

      await connection.query(`DELETE FROM cart_items WHERE cart_item_id = ?`, [cartItemId]);

      // Recalculate cart total
      const [[{ totalAmount }]] = await connection.query(
        `SELECT SUM(subtotal) as totalAmount FROM cart_items WHERE cart_id = ?`,
        [cartId],
      );

      await connection.query(
        `UPDATE shopping_carts SET total_amount = ? WHERE cart_id = ?`,
        [totalAmount || 0, cartId],
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Clear entire cart
  static async clearCart(cartId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(`DELETE FROM cart_items WHERE cart_id = ?`, [cartId]);
      await connection.query(`UPDATE shopping_carts SET total_amount = 0 WHERE cart_id = ?`, [
        cartId,
      ]);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = CartModel;
