const RoleModel = require("../models/roleModel");
const UserModel = require("../models/userModel");
const SystemLogModel = require("../models/systemLogModel");

// GET /api/roles
const getRoles = async (req, res) => {
  try {
    const roles = await RoleModel.getAll();

    res.json({
      success: true,
      roles,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// PUT /api/roles/:id
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_name } = req.body;

    if (!role_name) {
      return res.status(400).json({
        success: false,
        message: "role_name is required",
      });
    }

    const role = await RoleModel.findById(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    await RoleModel.updateName(id, role_name);

    await SystemLogModel.create({
      user_id: req.user.user_id,
      action: "UPDATE_ROLE",
      description: `Updated role (role_id: ${id}) to name "${role_name}"`,
      ip_address: req.ip,
    });

    res.json({
      success: true,
      message: "Role updated",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// GET /api/roles/users
const getUsersWithRoles = async (req, res) => {
  try {
    const users = await RoleModel.getAllUsersWithRoles();

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// PUT /api/roles/users/:userId
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role_id } = req.body;

    if (!role_id) {
      return res.status(400).json({
        success: false,
        message: "role_id is required",
      });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const role = await RoleModel.findById(role_id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    await RoleModel.updateUserRole(userId, role_id);

    await SystemLogModel.create({
      user_id: req.user.user_id,
      action: "UPDATE_USER_ROLE",
      description: `Updated role of user (user_id: ${userId}) to "${role.role_name}"`,
      ip_address: req.ip,
    });

    res.json({
      success: true,
      message: "User role updated",
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
  getRoles,
  updateRole,
  getUsersWithRoles,
  updateUserRole,
};
