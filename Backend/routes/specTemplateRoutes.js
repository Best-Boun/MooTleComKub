const express = require("express");
const router = express.Router();

const { getByCategory } = require("../controllers/specTemplateController");

// ดึง spec field names ตาม category (ไม่มี auth เพิ่มเติมตาม pattern ของ categoryRoutes/brandRoutes เดิม)
router.get("/category/:categoryId", getByCategory);

module.exports = router;
