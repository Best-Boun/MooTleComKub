const express = require("express");

const router = express.Router();

const { getRoles, updateRole, getUsersWithRoles, updateUserRole } = require("../controllers/roleController");

const authMiddleware = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/roleMiddleware");
const ROLES = require("../utils/roles");

// ทุก Route ต้อง Login และเป็น SuperAdmin เท่านั้น
router.use(authMiddleware, requireRole(ROLES.SUPER_ADMIN));

// Retrieve all system roles
router.get("/", getRoles);

// Retrieve all users in the system with their current role
router.get("/users", getUsersWithRoles);

// Update the role assigned to a user
router.put("/users/:userId", updateUserRole);

// Update role information
router.put("/:id", updateRole);

module.exports = router;
