const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const PaymentController = require("../controllers/paymentController");

// All routes require authentication
router.use(authMiddleware);

// POST /api/payments
router.post("/", PaymentController.createPayment);

// GET /api/payments/:id
router.get("/:id", PaymentController.getPayment);

module.exports = router;
