const OrderModel = require("../models/orderModel");

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

      const result = await OrderModel.updateOrderStatus(
        req.params.id,
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
}

module.exports = OrderController;
