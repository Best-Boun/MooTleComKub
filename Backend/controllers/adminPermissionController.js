const AdminPermissionModel = require("../models/adminPermissionModel");
const SystemLogModel = require("../models/systemLogModel");
const ROLES = require("../utils/roles");

// GET /api/admin-permissions
// เฉพาะ SuperAdmin - ดึงตาราง Admin ทุกคนพร้อมสิทธิ์ทุกหน้า สำหรับหน้าจัดการสิทธิ์
const getPermissionsMatrix = async (req, res) => {
  try {
    const admins = await AdminPermissionModel.getMatrixForAllAdmins();

    res.json({
      success: true,
      pages: AdminPermissionModel.PAGES,
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

// PUT /api/admin-permissions/:userId
// เฉพาะ SuperAdmin - บันทึกสิทธิ์ของ Admin คนเดียว
const updatePermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: "permissions must be an array",
      });
    }

    await AdminPermissionModel.saveForUser(userId, permissions);

    await SystemLogModel.create({
      user_id: req.user.user_id,
      action: "UPDATE_ADMIN_PERMISSIONS",
      description: `Updated page permissions for admin (user_id: ${userId})`,
      ip_address: req.ip,
    });

    res.json({
      success: true,
      message: "Permissions updated",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// GET /api/admin-permissions/me
// ทุกคนที่ Login แล้วเรียกได้ - ใช้ให้ Frontend รู้ว่าตัวเองเห็น/จัดการหน้าไหนได้บ้าง
// SuperAdmin จะได้สิทธิ์เต็มทุกหน้าเสมอ
const getMyPermissions = async (req, res) => {
  try {
    if (req.user.role_id === ROLES.SUPER_ADMIN) {
      const permissions = {};

      for (const page of AdminPermissionModel.PAGES) {
        permissions[page] = { can_view: 1, can_manage: 1 };
      }

      return res.json({ success: true, permissions });
    }

    const permissions = await AdminPermissionModel.getPermissionsMap(req.user.user_id);

    res.json({
      success: true,
      permissions,
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
  getPermissionsMatrix,
  updatePermissions,
  getMyPermissions,
};
