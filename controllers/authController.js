/**
 * controllers/authController.js
 * register, login, logout, getMe
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { validationResult } = require("express-validator");

/* ── JWT helper ─────────────────────────── */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  const cookieOptions = {
    expires: new Date(
      Date.now() +
        (parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 7) *
          24 *
          60 *
          60 *
          1000,
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res.cookie("jwt", token, cookieOptions);

  const { password: _pw, ...safeUser } = user;
  res
    .status(statusCode)
    .json({ status: "success", token, data: { user: safeUser } });
};

/* ── Controllers ────────────────────────── */

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ status: "fail", errors: errors.array() });
    }

    const { name, email, password, college, phone } = req.body;

    const existing = await User.findByEmail(email);
    if (existing) {
      return res
        .status(409)
        .json({ status: "fail", message: "Email already in use." });
    }

    const id = await User.create({ name, email, password, college, phone });
    const user = await User.findById(id);
    sendToken({ ...user, password }, 201, res);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ status: "fail", errors: errors.array() });
    }

    const { email, password } = req.body;

    // Fetch with password
    const user = await User.findByEmail(email);
    if (!user || !(await User.comparePassword(password, user.password))) {
      return res
        .status(401)
        .json({ status: "fail", message: "Invalid email or password." });
    }

    if (!user.is_active) {
      return res
        .status(403)
        .json({
          status: "fail",
          message: "Your account has been deactivated.",
        });
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.logout = (_req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success", message: "Logged out." });
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ status: "success", data: { user } });
  } catch (err) {
    next(err);
  }
};
