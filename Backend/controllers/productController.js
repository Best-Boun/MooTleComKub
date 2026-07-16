const ProductModel = require("../models/productModel");

class ProductController {
  // GET /api/products
  static async getAllProducts(req, res) {
    try {
      const products = await ProductModel.getAllProducts();

      res.status(200).json({
        success: true,
        count: products.length,
        data: products,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch products",
      });
    }
  }

  // GET /api/products/:id
  static async getProductById(req, res) {
    try {
      const product = await ProductModel.getProductById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch product",
      });
    }
  }

  // POST /api/products
  static async createProduct(req, res) {
    try {
      if (req.file) {
        req.body.image = `/uploads/${req.file.filename}`;
      }

      const result = await ProductModel.createProduct(req.body);

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        product_id: result.insertId,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to create product",
      });
    }
  }

  // PUT /api/products/:id
  static async updateProduct(req, res) {
    try {
      if (req.file) {
        req.body.image = `/uploads/${req.file.filename}`;
      }

      const result = await ProductModel.updateProduct(req.params.id, req.body);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Product updated successfully",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to update product",
      });
    }
  }

  // DELETE /api/products/:id
  static async deleteProduct(req, res) {
    try {
      const result = await ProductModel.deleteProduct(req.params.id);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to delete product",
      });
    }
  }

  static async getActiveProducts(req, res) {
    try {
      const products = await ProductModel.getActiveProducts();

      res.status(200).json({
        success: true,
        count: products.length,
        data: products,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch products",
      });
    }
  }
}

module.exports = ProductController;
