/**
 * routes/authRoutes.js
 * POST /api/v1/auth/register
 * POST /api/v1/auth/login
 * POST /api/v1/auth/logout
 * GET  /api/v1/auth/me   (protected)
 */

const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const {
  register,
  login,
  logout,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email required."),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters."),
  ],
  register,
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email required."),
    body("password").notEmpty().withMessage("Password required."),
  ],
  login,
);

router.post("/logout", logout);

router.get("/me", protect, getMe);

module.exports = router;
