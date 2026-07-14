const AdminModel = require("../models/adminModel");
const UserModel = require("../models/userModel");
const SystemLogModel = require("../models/systemLogModel");
const { hashPassword } = require("../utils/hashPassword");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/admins
const getAdmins = async (req, res) => {
  try {
    const admins = await AdminModel.getAll();

    res.json({
      success: true,
      admins,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// POST /api/admins
const createAdmin = async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      });
    }

    if (!EMAIL_REGEX.test(email)) {
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

    const existingUser = await UserModel.findByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const password_hash = await hashPassword(password);

    const adminId = await AdminModel.create({
      first_name,
      last_name,
      email,
      password_hash,
      phone,
    });

    await SystemLogModel.create({
      user_id: req.user.user_id,
      action: "CREATE_ADMIN",
      description: `Created admin account (user_id: ${adminId})`,
      ip_address: req.ip,
    });

    res.status(201).json({
      success: true,
      message: "Admin account created",
      user_id: adminId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// PUT /api/admins/:id
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, status } = req.body;

    const admin = await AdminModel.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found",
      });
    }

    if (email && !EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (email && email !== admin.email) {
      const existingUser = await UserModel.findByEmail(email);

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    if (status && !["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const updated = await AdminModel.update(id, {
      first_name,
      last_name,
      email,
      phone,
      status,
    });

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    await SystemLogModel.create({
      user_id: req.user.user_id,
      action: "UPDATE_ADMIN",
      description: `Updated admin account (user_id: ${id})`,
      ip_address: req.ip,
    });

    res.json({
      success: true,
      message: "Admin account updated",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// DELETE /api/admins/:id
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await AdminModel.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found",
      });
    }

    await AdminModel.remove(id);

    await SystemLogModel.create({
      user_id: req.user.user_id,
      action: "DELETE_ADMIN",
      description: `Deleted admin account (user_id: ${id})`,
      ip_address: req.ip,
    });

    res.json({
      success: true,
      message: "Admin account deleted",
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
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};
