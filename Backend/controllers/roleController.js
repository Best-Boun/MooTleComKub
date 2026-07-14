const RoleModel = require("../models/roleModel");
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

module.exports = {
  getRoles,
  updateRole,
};
