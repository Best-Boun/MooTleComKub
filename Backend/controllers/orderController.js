const OrderModel = require("../models/orderModel");

// กติกาการเปลี่ยนสถานะ: PAID เกิดได้จาก createPayment เท่านั้น ไม่ใช่ Admin กดเอง
const ALLOWED_TRANSITIONS = {
  PENDING: ["CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

class OrderController {
  // GET /api/orders
  static async getAllOrders(req, res) {
    try {
      const orders = await OrderModel.getAllOrders();

      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
      });
    }
  }

  // GET /api/orders/:id
  static async getOrderById(req, res) {
    try {
      const order = await OrderModel.getOrderById(req.params.id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      const userId = req.user.user_id;
      const isOwner = order.order.user_id === userId;
      const isAdmin = req.user.role_id === 2 || req.user.role_id === 3;

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized - order does not belong to user",
        });
      }

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch order",
      });
    }
  }

  // PUT /api/orders/:id/status
  static async updateOrderStatus(req, res) {
    try {
      const { order_status } = req.body;
      const orderId = req.params.id;

      if (order_status === "PAID") {
        return res.status(400).json({
          success: false,
          message:
            "ไม่สามารถเปลี่ยนสถานะเป็น Paid ได้โดยตรง ต้องชำระเงินผ่านระบบเท่านั้น",
        });
      }

      const currentStatus = await OrderModel.getOrderStatusById(orderId);

      if (!currentStatus) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];

      if (!allowedNext.includes(order_status)) {
        return res.status(400).json({
          success: false,
          message: `ไม่สามารถเปลี่ยนสถานะจาก ${currentStatus} เป็น ${order_status} ได้`,
        });
      }

      if (
        order_status === "CANCELLED" &&
        (currentStatus === "PAID" || currentStatus === "SHIPPED")
      ) {
        await OrderModel.restoreStockForOrder(orderId);
      }

      const result = await OrderModel.updateOrderStatus(
        orderId,
        order_status,
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Order status updated successfully",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to update order status",
      });
    }
  }

  // DELETE /api/orders/:id
  static async deleteOrder(req, res) {
    try {
      const result = await OrderModel.deleteOrder(req.params.id);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Order deleted successfully",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to delete order",
      });
    }
  }

  // POST /api/orders
  static async createOrder(req, res) {
    try {
      const userId = req.user.user_id;
      const { address_id } = req.body;

      if (!address_id || Number.isNaN(Number(address_id))) {
        return res.status(400).json({
          success: false,
          message: "Valid address_id is required",
        });
      }

      const result = await OrderModel.createOrder(userId, Number(address_id));

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error,
        });
      }

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: {
          order_id: result.orderId,
        },
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to create order",
      });
    }
  }

  // GET /api/orders/my
  static async getMyOrders(req, res) {
    try {
      const userId = req.user.user_id;
      const orders = await OrderModel.getOrdersByUserId(userId);

      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch my orders",
      });
    }
  }
}

module.exports = OrderController;
