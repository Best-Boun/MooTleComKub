const db = require("../config/db");

class PaymentModel {
  // Get payment by ID
  static async getPaymentById(paymentId) {
    const [rows] = await db.query(
      `SELECT 
        payment_id,
        order_id,
        payment_method,
        amount,
        payment_status,
        transaction_id,
        paid_at,
        created_at,
        updated_at
      FROM payments
      WHERE payment_id = ?
      LIMIT 1`,
      [paymentId],
    );

    return rows[0];
  }

  // Get payment by order ID
  static async getPaymentByOrderId(orderId) {
    const [rows] = await db.query(
      `SELECT 
        payment_id,
        order_id,
        payment_method,
        amount,
        payment_status,
        transaction_id,
        paid_at,
        created_at,
        updated_at
      FROM payments
      WHERE order_id = ?
      LIMIT 1`,
      [orderId],
    );

    return rows[0];
  }

  // Get order details
  static async getOrderById(orderId) {
    const [rows] = await db.query(
      `SELECT 
        order_id,
        user_id,
        total_amount,
        order_status,
        created_at
      FROM orders
      WHERE order_id = ?
      LIMIT 1`,
      [orderId],
    );

    return rows[0];
  }

  // Create payment record
  static async createPayment(paymentData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const { orderId, userId, paymentMethod, amount } = paymentData;

      // Verify order exists and belongs to user
      const [[order]] = await connection.query(
        `SELECT order_id, user_id, total_amount FROM orders WHERE order_id = ? AND user_id = ? LIMIT 1`,
        [orderId, userId],
      );

      if (!order) {
        await connection.rollback();
        return { success: false, error: "Order not found or does not belong to user" };
      }

      // Check if payment already exists for this order
      const [[existingPayment]] = await connection.query(
        `SELECT payment_id FROM payments WHERE order_id = ? LIMIT 1`,
        [orderId],
      );

      if (existingPayment) {
        await connection.rollback();
        return { success: false, error: "Order already has a payment" };
      }

      // Generate transaction ID
      const transactionId = this.generateTransactionId();

      // Create payment record with PAID status (mock payment gateway - immediate success)
      const [paymentResult] = await connection.query(
        `INSERT INTO payments 
        (order_id, payment_method, amount, payment_status, transaction_id, paid_at)
        VALUES (?, ?, ?, 'PAID', ?, NOW())`,
        [orderId, paymentMethod, amount, transactionId],
      );

      await connection.commit();

      return {
        success: true,
        paymentId: paymentResult.insertId,
        transactionId,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Generate random transaction ID
  static generateTransactionId() {
    const timestamp = new Date().getTime();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TX${timestamp.toString().slice(-8)}${random}`;
  }
}

module.exports = PaymentModel;
