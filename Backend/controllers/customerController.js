const CustomerModel = require("../models/customerModel");

class CustomerController {
  // GET /api/customers
  static async getAllCustomers(req, res) {
    try {
      const customers = await CustomerModel.getAllCustomers();

      res.status(200).json({
        success: true,
        count: customers.length,
        data: customers,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch customers",
      });
    }
  }

  // GET /api/customers/:id
  static async getCustomerById(req, res) {
    try {
      const customer = await CustomerModel.getCustomerById(req.params.id);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch customer",
      });
    }
  }

  // PUT /api/customers/:id
  static async updateCustomer(req, res) {
    try {
      const result = await CustomerModel.updateCustomer(
        req.params.id,
        req.body,
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Customer updated successfully",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to update customer",
      });
    }
  }

  // DELETE /api/customers/:id
  static async deleteCustomer(req, res) {
    try {
      const result = await CustomerModel.deleteCustomer(req.params.id);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Customer deleted successfully",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to delete customer",
      });
    }
  }

  // GET /api/customers/:id/orders
  static async getCustomerOrders(req, res) {
    try {
      const orders = await CustomerModel.getCustomerOrders(req.params.id);

      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch customer orders",
      });
    }
  }

  // GET /api/customers/:id/statistics
  static async getCustomerStatistics(req, res) {
    try {
      const stats = await CustomerModel.getCustomerStatistics(req.params.id);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch customer statistics",
      });
    }
  }
}

module.exports = CustomerController;
