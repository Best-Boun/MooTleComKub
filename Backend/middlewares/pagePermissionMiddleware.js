const AdminPermissionModel = require("../models/adminPermissionModel");
const ROLES = require("../utils/roles");

// level: "view" | "manage"
//
// - SuperAdmin: ผ่านเสมอ (มีสิทธิ์เต็มทุกหน้า)
// - Customer หรือ role อื่นที่ไม่ใช่ Admin: ผ่านเสมอ (endpoint เหล่านี้มี requireRole
//   ควบคุมอยู่แล้วในบาง route ส่วน route ที่ Customer ใช้ร่วมกับ Admin เช่น
//   GET /api/orders/:id จะไม่ถูกจำกัดด้วยระบบสิทธิ์หน้านี้)
// - Admin (role_id 2): ต้องมีสิทธิ์ที่ตรงกับ pageKey/level ใน admin_page_permissions
//   ไม่งั้นตอบ 403
const requirePagePermission = (pageKey, level = "view") => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (req.user.role_id !== ROLES.ADMIN) {
      return next();
    }

    try {
      const allowed = await AdminPermissionModel.hasPermission(
        req.user.user_id,
        pageKey,
        level,
      );

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: no "${level}" permission for "${pageKey}"`,
        });
      }

      next();
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  };
};

module.exports = requirePagePermission;
