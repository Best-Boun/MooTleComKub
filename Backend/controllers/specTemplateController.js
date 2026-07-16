const SpecTemplateModel = require("../models/specTemplateModel");

// GET /api/spec-templates/categories/:categoryId
const getByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId || Number.isNaN(Number(categoryId))) {
      return res.status(400).json({
        success: false,
        message: "categoryId must be a number",
      });
    }

    const templates = await SpecTemplateModel.getAllByCategory(categoryId);

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// GET /api/spec-templates
const getAll = async (req, res) => {
  try {
    const templates = await SpecTemplateModel.getAll();

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// POST /api/spec-templates
const create = async (req, res) => {
  try {
    const { category_id, spec_name } = req.body;

    if (!category_id || Number.isNaN(Number(category_id))) {
      return res.status(400).json({
        success: false,
        message: "category_id must be a number",
      });
    }

    if (!spec_name || !spec_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "spec_name is required",
      });
    }

    const result = await SpecTemplateModel.create(
      Number(category_id),
      spec_name.trim(),
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    res.status(201).json({
      success: true,
      message: "Spec template created successfully",
      template_id: result.templateId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// DELETE /api/spec-templates/:id
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const affectedRows = await SpecTemplateModel.delete(id);

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Spec template not found",
      });
    }

    res.json({
      success: true,
      message: "Spec template deleted successfully",
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
  getAll,
  create,
  remove,
};
