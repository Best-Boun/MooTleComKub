-- Migration: เพิ่มตารางสำหรับเก็บสิทธิ์การเข้าถึงหน้าต่างๆ ของ Admin (role_id = 2)
-- แต่ละแถวคือสิทธิ์ของ Admin 1 คน ต่อ 1 หน้า (page_key) ประกอบด้วย
--   can_view   = มองเห็น/เข้าหน้านั้นได้ไหม
--   can_manage = แก้ไข/สร้าง/ลบข้อมูลในหน้านั้นได้ไหม (ต้องมี can_view ด้วยจึงจะมีความหมาย)
--
-- page_key ที่ระบบรองรับตอนนี้: dashboard, categories, products, orders, customers

CREATE TABLE IF NOT EXISTS admin_page_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  page_key VARCHAR(50) NOT NULL,
  can_view TINYINT(1) NOT NULL DEFAULT 0,
  can_manage TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_page (user_id, page_key),
  CONSTRAINT fk_admin_page_permissions_user
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
