// วิธีใช้: วางไฟล์นี้ไว้ที่ Backend/scripts/runMigration.js
// แล้วรันจากโฟลเดอร์ Backend ด้วยคำสั่ง:
//   node scripts/runMigration.js
//
// สคริปต์นี้จะอ่านไฟล์ migration_admin_page_permissions.sql แล้วรันผ่าน
// connection เดียวกับที่แอปใช้ (Backend/config/db.js + .env) จึงไม่ต้องกรอก
// host/user/password ซ้ำ

const fs = require("fs");
const path = require("path");
const db = require("../config/db");

async function run() {
  // แก้ path นี้ถ้าคุณเก็บไฟล์ .sql ไว้คนละที่
  const sqlPath = path.join(__dirname, "..", "migration_admin_page_permissions.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  try {
    await db.query(sql);
    console.log("✅ Migration สำเร็จ: สร้างตาราง admin_page_permissions เรียบร้อยแล้ว");
  } catch (error) {
    console.error("❌ Migration ล้มเหลว:", error.message);
  } finally {
    await db.end();
  }
}

run();
