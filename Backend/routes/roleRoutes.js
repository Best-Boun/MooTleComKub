const express = require("express");

const router = express.Router();

const { getRoles, updateRole } = require("../controllers/roleController");

const authMiddleware = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/roleMiddleware");
const ROLES = require("../utils/roles");

// ทุก Route ต้อง Login และเป็น SuperAdmin เท่านั้น
router.use(authMiddleware, requireRole(ROLES.SUPER_ADMIN));

// Retrieve all system roles
router.get("/", getRoles);

// Update role information
router.put("/:id", updateRole);

module.exports = router;
