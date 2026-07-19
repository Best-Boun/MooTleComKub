const db = require("../config/db");

// รายชื่อหน้าที่อยู่ภายใต้ระบบสิทธิ์นี้ (ต้องตรงกับฝั่ง Frontend)
const PAGES = ["dashboard", "categories", "products", "orders", "customers"];

class AdminPermissionModel {
  static get PAGES() {
    return PAGES;
  }

  // ดึงสิทธิ์ทั้งหมดของ user คนเดียว คืนค่าเป็น map { page_key: { can_view, can_manage } }
  // หน้าไหนไม่มีแถวใน DB จะถือว่า can_view/can_manage = 0 ทั้งคู่
  static async getPermissionsMap(userId) {
    const [rows] = await db.query(
      "SELECT page_key, can_view, can_manage FROM admin_page_permissions WHERE user_id = ?",
      [userId],
    );

    const map = {};

    for (const page of PAGES) {
      map[page] = { can_view: 0, can_manage: 0 };
    }

    for (const row of rows) {
      map[row.page_key] = {
        can_view: row.can_view ? 1 : 0,
        can_manage: row.can_manage ? 1 : 0,
      };
    }

    return map;
  }

  // ใช้ตอนตรวจสอบสิทธิ์ระดับ API (level = "view" | "manage")
  static async hasPermission(userId, pageKey, level) {
    const [rows] = await db.query(
      "SELECT can_view, can_manage FROM admin_page_permissions WHERE user_id = ? AND page_key = ? LIMIT 1",
      [userId, pageKey],
    );

    if (rows.length === 0) {
      return false;
    }

    if (level === "manage") {
      return Boolean(rows[0].can_manage);
    }

    return Boolean(rows[0].can_view);
  }

  // ดึง Admin (role_id = 2) ทั้งหมดพร้อมสิทธิ์ของแต่ละคน สำหรับหน้าจัดการสิทธิ์
  static async getMatrixForAllAdmins() {
    const [admins] = await db.query(
      `SELECT user_id, first_name, last_name, email, status
       FROM users
       WHERE role_id = 2
       ORDER BY user_id ASC`,
    );

    const [rows] = await db.query(
      "SELECT user_id, page_key, can_view, can_manage FROM admin_page_permissions",
    );

    const byUser = {};

    for (const row of rows) {
      if (!byUser[row.user_id]) {
        byUser[row.user_id] = {};
      }

      byUser[row.user_id][row.page_key] = {
        can_view: row.can_view ? 1 : 0,
        can_manage: row.can_manage ? 1 : 0,
      };
    }

    return admins.map((admin) => {
      const permissions = {};

      for (const page of PAGES) {
        permissions[page] = byUser[admin.user_id]?.[page] || {
          can_view: 0,
          can_manage: 0,
        };
      }

      return { ...admin, permissions };
    });
  }

  // บันทึกสิทธิ์ทั้งชุดของ Admin 1 คน (เขียนทับทุกหน้าในคราวเดียว)
  // permissions: [{ page_key, can_view, can_manage }, ...]
  static async saveForUser(userId, permissions) {
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      for (const item of permissions) {
        if (!PAGES.includes(item.page_key)) {
          continue;
        }

        const canView = item.can_view ? 1 : 0;
        // can_manage ไม่มีความหมายถ้าไม่มี can_view ก็เลยบังคับให้เป็น 0 ไปด้วย
        const canManage = canView && item.can_manage ? 1 : 0;

        await conn.query(
          `INSERT INTO admin_page_permissions (user_id, page_key, can_view, can_manage)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE can_view = VALUES(can_view), can_manage = VALUES(can_manage)`,
          [userId, item.page_key, canView, canManage],
        );
      }

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
}

module.exports = AdminPermissionModel;
