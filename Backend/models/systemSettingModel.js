const db = require("../config/db");

class SystemSettingModel {
  // ดึง System Settings ทั้งหมด
  static async getAll() {
    const [rows] = await db.query(
      "SELECT setting_key, setting_value, updated_at FROM system_settings",
    );

    return rows;
  }

  // อัปเดต (หรือสร้างใหม่ถ้ายังไม่มี) หลาย Settings พร้อมกัน
  static async upsertMany(settings) {
    const keys = Object.keys(settings);

    for (const key of keys) {
      await db.query(
        `INSERT INTO system_settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE
           setting_value = VALUES(setting_value),
           updated_at = CURRENT_TIMESTAMP`,
        [key, String(settings[key])],
      );
    }

    return true;
  }
}

module.exports = SystemSettingModel;
