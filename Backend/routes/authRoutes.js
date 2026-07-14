const express = require("express");

const router = express.Router();

const { register, login, profile } = require("../controllers/authController");

const authMiddleware = require("../middlewares/authMiddleware");

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Profile
router.get("/profile", authMiddleware, profile);

module.exports = router;
