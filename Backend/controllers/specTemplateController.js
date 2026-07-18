const SpecTemplateModel = require("../models/specTemplateModel");

// GET /api/spec-templates/category/:categoryId
const getByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId || Number.isNaN(Number(categoryId))) {
      return res.status(400).json({
        success: false,
        message: "categoryId must be a number",
      });
    }

    const specNames = await SpecTemplateModel.getSpecNamesByCategory(categoryId);

    res.json({
      success: true,
      data: specNames,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getByCategory,
};
