const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");

// All routes require authentication
router.use(authMiddleware);

// GET /api/cart
router.get("/", getCart);

// POST /api/cart/items
router.post("/items", addCartItem);

// PUT /api/cart/items/:id
router.put("/items/:id", updateCartItem);

// DELETE /api/cart/items/:id
router.delete("/items/:id", removeCartItem);

// DELETE /api/cart
router.delete("/", clearCart);

module.exports = router;
