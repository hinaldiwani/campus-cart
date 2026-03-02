/**
 * middleware/adminAuth.js
 * Must be used AFTER the `protect` middleware.
 * Ensures the authenticated user has role === 'admin'.
 */

function adminOnly(req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied. Admin privileges required.",
  });
}

module.exports = { adminOnly };
