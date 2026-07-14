const UserModel = require("../models/userModel");
const { hashPassword, comparePassword } = require("../utils/hashPassword");
const generateToken = require("../utils/generateToken");

const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone } = req.body;

    // Validation
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // เช็ค Email ซ้ำ
    const existingUser = await UserModel.findByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash Password
    const password_hash = await hashPassword(password);

    // Customer = role_id 1
    const userId = await UserModel.createUser({
      role_id: 1,
      first_name,
      last_name,
      email,
      password_hash,
      phone: phone || null,
    });

    res.status(201).json({
      success: true,
      message: "Register Success",
      user_id: userId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const user = await UserModel.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email or Password incorrect",
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Account is not active",
      });
    }

    const isMatch = await comparePassword(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Email or Password incorrect",
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role_id: user.role_id,
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

const profile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.user_id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,

      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role_id: user.role_id,
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

module.exports = {
  register,
  login,
  profile,
};