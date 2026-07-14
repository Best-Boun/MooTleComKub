const CartModel = require("../models/cartModel");
const db = require("../config/db");

// GET /api/cart - Get user's shopping cart
const getCart = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Check if cart exists, create if not
    let cart = await CartModel.findCartByUserId(userId);
    if (!cart) {
      const cartId = await CartModel.createCart(userId);
      cart = { cart_id: cartId };
    }

    const cartData = await CartModel.getCartByUserId(userId);

    res.json({
      success: true,
      data: cartData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// POST /api/cart/items - Add item to cart
const addCartItem = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { product_id, quantity } = req.body;

    // Validation
    if (!product_id || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required",
      });
    }

    if (Number.isNaN(Number(product_id)) || Number.isNaN(Number(quantity))) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity must be numbers",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    // Check if product exists and is available
    const [productRows] = await db.query(
      `SELECT product_id, price, stock, status FROM products WHERE product_id = ? LIMIT 1`,
      [product_id],
    );

    if (productRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = productRows[0];

    if (product.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Product is not available",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    // Get or create cart
    let cart = await CartModel.findCartByUserId(userId);
    if (!cart) {
      const cartId = await CartModel.createCart(userId);
      cart = { cart_id: cartId };
    }

    // Add item to cart
    await CartModel.addCartItem(cart.cart_id, product_id, quantity, product.price);

    const updatedCart = await CartModel.getCartByUserId(userId);

    res.status(201).json({
      success: true,
      message: "Item added to cart",
      data: updatedCart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// PUT /api/cart/items/:id - Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const cartItemId = Number(req.params.id);
    const { quantity } = req.body;

    // Validation
    if (Number.isNaN(cartItemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart item ID",
      });
    }

    if (!quantity) {
      return res.status(400).json({
        success: false,
        message: "Quantity is required",
      });
    }

    if (Number.isNaN(Number(quantity))) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a number",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    // Get cart item
    const cartItem = await CartModel.getCartItem(cartItemId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // Verify user owns this cart
    const [cartRows] = await db.query(
      `SELECT user_id FROM shopping_carts WHERE cart_id = ? LIMIT 1`,
      [cartItem.cart_id],
    );

    if (cartRows.length === 0 || cartRows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Check product stock
    if (cartItem.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    // Update quantity
    await CartModel.updateCartItem(cartItemId, quantity, cartItem.price);

    const updatedCart = await CartModel.getCartByUserId(userId);

    res.json({
      success: true,
      message: "Cart item updated",
      data: updatedCart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// DELETE /api/cart/items/:id - Remove cart item
const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const cartItemId = Number(req.params.id);

    // Validation
    if (Number.isNaN(cartItemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart item ID",
      });
    }

    // Get cart item
    const cartItem = await CartModel.getCartItem(cartItemId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // Verify user owns this cart
    const [cartRows] = await db.query(
      `SELECT user_id FROM shopping_carts WHERE cart_id = ? LIMIT 1`,
      [cartItem.cart_id],
    );

    if (cartRows.length === 0 || cartRows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Remove item
    await CartModel.removeCartItem(cartItemId);

    const updatedCart = await CartModel.getCartByUserId(userId);

    res.json({
      success: true,
      message: "Item removed from cart",
      data: updatedCart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// DELETE /api/cart - Clear entire cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Get user's cart
    const cart = await CartModel.findCartByUserId(userId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Clear cart
    await CartModel.clearCart(cart.cart_id);

    res.json({
      success: true,
      message: "Cart cleared",
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
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
};
