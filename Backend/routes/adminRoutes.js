const express = require("express");

const router = express.Router();

const {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} = require("../controllers/adminController");

const authMiddleware = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/roleMiddleware");
const ROLES = require("../utils/roles");

// ทุก Route ต้อง Login และเป็น SuperAdmin เท่านั้น
router.use(authMiddleware, requireRole(ROLES.SUPER_ADMIN));

// Retrieve administrator accounts
router.get("/", getAdmins);

// Create a new administrator account
router.post("/", createAdmin);

// Update administrator account
router.put("/:id", updateAdmin);

// Delete administrator account
router.delete("/:id", deleteAdmin);

module.exports = router;
