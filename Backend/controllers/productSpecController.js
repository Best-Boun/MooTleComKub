const ProductSpecModel = require("../models/productSpecModel");
const SpecTemplateModel = require("../models/specTemplateModel");
const ProductModel = require("../models/productModel");

// GET /api/product-specs/product/:productId
const getByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId || Number.isNaN(Number(productId))) {
      return res.status(400).json({
        success: false,
        message: "productId must be a number",
      });
    }

    const specs = await ProductSpecModel.getByProductId(productId);

    res.json({
      success: true,
      data: specs,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// POST /api/product-specs/compare
const compare = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: "productIds must be an array with at least 2 items",
      });
    }

    const hasInvalidId = productIds.some((id) => Number.isNaN(Number(id)));

    if (hasInvalidId) {
      return res.status(400).json({
        success: false,
        message: "All productIds must be numbers",
      });
    }

    const products = await Promise.all(
      productIds.map((id) => ProductModel.getProductById(id)),
    );

    const missingIndex = products.findIndex((p) => !p);

    if (missingIndex !== -1) {
      return res.status(404).json({
        success: false,
        message: `Product not found: ${productIds[missingIndex]}`,
      });
    }

    const categoryIds = new Set(products.map((p) => p.category_id));

    if (categoryIds.size > 1) {
      return res.status(400).json({
        success: false,
        message: "Products must be the same category",
      });
    }

    const specs = await ProductSpecModel.getByProductIds(productIds);

    const specsByProduct = {};
    productIds.forEach((id) => {
      specsByProduct[id] = [];
    });

    specs.forEach((spec) => {
      if (!specsByProduct[spec.product_id]) {
        specsByProduct[spec.product_id] = [];
      }
      specsByProduct[spec.product_id].push(spec);
    });

    res.json({
      success: true,
      data: {
        products: products.map((p) => ({
          product_id: p.product_id,
          product_name: p.product_name,
          category_id: p.category_id,
        })),
        specs: specsByProduct,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// PUT /api/product-specs/product/:productId
const updateProductSpecs = async (req, res) => {
  try {
    const { productId } = req.params;
    const { specs } = req.body;

    if (!productId || Number.isNaN(Number(productId))) {
      return res.status(400).json({
        success: false,
        message: "productId must be a number",
      });
    }

    if (!Array.isArray(specs)) {
      return res.status(400).json({
        success: false,
        message: "specs must be an array",
      });
    }

    const product = await ProductModel.getProductById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const templates = await SpecTemplateModel.getAllByCategory(product.category_id);
    const allowedSpecNames = new Set(templates.map((t) => t.spec_name));

    for (const spec of specs) {
      if (!spec.specName || !spec.specValue) {
        return res.status(400).json({
          success: false,
          message: "Each spec must have specName and specValue",
        });
      }

      if (!allowedSpecNames.has(spec.specName)) {
        return res.status(400).json({
          success: false,
          message: `"${spec.specName}" is not a valid spec for this product's category`,
        });
      }
    }

    await ProductSpecModel.upsertMany(productId, specs);

    res.json({
      success: true,
      message: "Product specs updated successfully",
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
  getByProduct,
  compare,
  updateProductSpecs,
};
