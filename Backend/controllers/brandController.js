const BrandModel = require("../models/brandModel");

class BrandController {
  // GET /api/brands/category/:categoryId
  static async getBrandsByCategory(req, res) {
    try {
      const brands = await BrandModel.getBrandsByCategory(
        req.params.categoryId,
      );

      res.status(200).json({
        success: true,
        count: brands.length,
        data: brands,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch brands",
      });
    }
  }

  // GET /api/brands/:id
  static async getBrandById(req, res) {
    try {
      const brand = await BrandModel.getBrandById(req.params.id);

      if (!brand) {
        return res.status(404).json({
          success: false,
          message: "Brand not found",
        });
      }

      res.status(200).json({
        success: true,
        data: brand,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch brand",
      });
    }
  }
}

module.exports = BrandController;
