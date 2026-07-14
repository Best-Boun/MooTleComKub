const express = require("express");

const router = express.Router();

const { getLogs, updateSettings } = require("../controllers/systemController");

const authMiddleware = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/roleMiddleware");
const ROLES = require("../utils/roles");

// ทุก Route ต้อง Login และเป็น SuperAdmin เท่านั้น
router.use(authMiddleware, requireRole(ROLES.SUPER_ADMIN));

// Retrieve system logs
router.get("/logs", getLogs);

// Update system settings
router.put("/settings", updateSettings);

module.exports = router;
