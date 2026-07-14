// Restricts access to users whose role_id (from the JWT payload) is in the allowed list.
// Must be used after authMiddleware, since it relies on req.user being set.
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role_id)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
};

module.exports = requireRole;
