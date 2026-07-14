const PaymentModel = require("../models/paymentModel");
const db = require("../config/db");

class PaymentController {
  // POST /api/payments - Create payment
  static async createPayment(req, res) {
    try {
      const userId = req.user.user_id;
      const { order_id, payment_method } = req.body;

      // Validation
      if (!order_id || !payment_method) {
        return res.status(400).json({
          success: false,
          message: "order_id and payment_method are required",
        });
      }

      if (Number.isNaN(Number(order_id))) {
        return res.status(400).json({
          success: false,
          message: "order_id must be a number",
        });
      }

      const validMethods = ["PROMPTPAY", "CREDIT_CARD", "BANK_TRANSFER"];
      if (!validMethods.includes(payment_method)) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment method. Allowed: PROMPTPAY, CREDIT_CARD, BANK_TRANSFER",
        });
      }

      // Get order details
      const order = await PaymentModel.getOrderById(order_id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Check if order belongs to user
      if (order.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized - order does not belong to user",
        });
      }

      // Create payment
      const result = await PaymentModel.createPayment({
        orderId: order_id,
        userId,
        paymentMethod: payment_method,
        amount: order.total_amount,
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error,
        });
      }

      // Get created payment
      const payment = await PaymentModel.getPaymentById(result.paymentId);

      res.status(201).json({
        success: true,
        message: "Payment successful.",
        data: {
          payment_id: payment.payment_id,
          order_id: payment.order_id,
          transaction_id: payment.transaction_id,
          payment_status: payment.payment_status,
          amount: payment.amount,
          payment_method: payment.payment_method,
          paid_at: payment.paid_at,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to process payment",
      });
    }
  }

  // GET /api/payments/:id - Get payment details
  static async getPayment(req, res) {
    try {
      const userId = req.user.user_id;
      const paymentId = Number(req.params.id);

      if (Number.isNaN(paymentId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment ID",
        });
      }

      // Get payment
      const payment = await PaymentModel.getPaymentById(paymentId);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      // Verify user owns the order
      const order = await PaymentModel.getOrderById(payment.order_id);
      if (!order || order.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }

      res.json({
        success: true,
        data: {
          payment_id: payment.payment_id,
          order_id: payment.order_id,
          payment_method: payment.payment_method,
          amount: payment.amount,
          payment_status: payment.payment_status,
          transaction_id: payment.transaction_id,
          paid_at: payment.paid_at,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch payment",
      });
    }
  }
}

module.exports = PaymentController;
