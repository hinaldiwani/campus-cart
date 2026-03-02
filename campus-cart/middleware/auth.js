/**
 * middleware/auth.js
 * Verifies JWT from Authorization header or signed cookie.
 * Attaches req.user = { id, email, role } on success.
 */

const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

/* ── Helpers ─────────────────────────────────────────────── */

/** Extract token from Bearer header OR httpOnly cookie */
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
}

/* ── Middleware ───────────────────────────────────────────── */

/**
 * protect — requires a valid JWT.
 * Attach req.user; call next() on success.
 */
async function protect(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated. Please log in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user row (so revoked/deleted accounts fail immediately)
    const [rows] = await pool.query(
      "SELECT id, name, email, role, is_active FROM users WHERE id = ?",
      [decoded.id],
    );

    if (!rows.length || !rows[0].is_active) {
      return res
        .status(401)
        .json({
          success: false,
          message: "User no longer exists or is disabled.",
        });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({
          success: false,
          message: "Session expired. Please log in again.",
        });
    }
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
}

/**
 * optionalAuth — like protect but does NOT reject unauthenticated requests.
 * Sets req.user if token is valid, otherwise leaves it undefined.
 */
async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const [rows] = await pool.query(
        "SELECT id, name, email, role, is_active FROM users WHERE id = ?",
        [decoded.id],
      );
      if (rows.length && rows[0].is_active) req.user = rows[0];
    }
  } catch (_) {
    /* silently ignore */
  }
  next();
}

module.exports = { protect, optionalAuth };
