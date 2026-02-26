/**
 * controllers/userController.js
 * Profile, password change, addresses, reviews.
 */

const User = require("../models/User");
const Review = require("../models/Review");
const Product = require("../models/Product");
const { pool } = require("../config/db");

/* ── Profile ─────────────────────────────── */

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ status: "success", data: { user } });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, college, phone, email } = req.body;
    const avatar = req.file
      ? `/images/avatars/${req.file.filename}`
      : undefined;

    await User.update(req.user.id, { name, college, phone, email, avatar });
    const user = await User.findById(req.user.id);

    res
      .status(200)
      .json({ status: "success", message: "Profile updated.", data: { user } });
  } catch (err) {
    next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "fail",
        message: "currentPassword and newPassword required.",
      });
    }

    // Fetch full user (with password hash)
    const fullUser = await User.findByEmail(req.user.email);
    const match = await User.comparePassword(
      currentPassword,
      fullUser.password,
    );
    if (!match) {
      return res
        .status(401)
        .json({ status: "fail", message: "Current password is incorrect." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        status: "fail",
        message: "New password must be at least 8 characters.",
      });
    }

    await User.updatePassword(req.user.id, newPassword);
    res.status(200).json({ status: "success", message: "Password updated." });
  } catch (err) {
    next(err);
  }
};

/* ── Addresses ───────────────────────────── */

exports.getAddresses = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC",
      [req.user.id],
    );
    res.status(200).json({ status: "success", data: { addresses: rows } });
  } catch (err) {
    next(err);
  }
};

exports.addAddress = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      line1,
      line2,
      city,
      state,
      pincode,
      is_default = false,
    } = req.body;

    if (!name || !phone || !line1 || !city || !state || !pincode) {
      return res.status(400).json({
        status: "fail",
        message: "All required address fields must be provided.",
      });
    }

    if (is_default) {
      await pool.query(
        "UPDATE addresses SET is_default = 0 WHERE user_id = ?",
        [req.user.id],
      );
    }

    const [result] = await pool.query(
      `INSERT INTO addresses (user_id, name, phone, line1, line2, city, state, pincode, is_default)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        req.user.id,
        name,
        phone,
        line1,
        line2 || null,
        city,
        state,
        pincode,
        is_default ? 1 : 0,
      ],
    );

    const [[address]] = await pool.query(
      "SELECT * FROM addresses WHERE id = ?",
      [result.insertId],
    );
    res.status(201).json({ status: "success", data: { address } });
  } catch (err) {
    next(err);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, line1, line2, city, state, pincode, is_default } =
      req.body;

    // Verify ownership
    const [[addr]] = await pool.query(
      "SELECT id FROM addresses WHERE id = ? AND user_id = ?",
      [id, req.user.id],
    );
    if (!addr)
      return res
        .status(404)
        .json({ status: "fail", message: "Address not found." });

    if (is_default) {
      await pool.query(
        "UPDATE addresses SET is_default = 0 WHERE user_id = ?",
        [req.user.id],
      );
    }

    await pool.query(
      `UPDATE addresses SET
         name = COALESCE(?, name), phone = COALESCE(?, phone),
         line1 = COALESCE(?, line1), line2 = COALESCE(?, line2),
         city = COALESCE(?, city), state = COALESCE(?, state),
         pincode = COALESCE(?, pincode), is_default = COALESCE(?, is_default)
       WHERE id = ?`,
      [
        name,
        phone,
        line1,
        line2,
        city,
        state,
        pincode,
        is_default !== undefined ? (is_default ? 1 : 0) : null,
        id,
      ],
    );

    const [[updated]] = await pool.query(
      "SELECT * FROM addresses WHERE id = ?",
      [id],
    );
    res.status(200).json({ status: "success", data: { address: updated } });
  } catch (err) {
    next(err);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      "DELETE FROM addresses WHERE id = ? AND user_id = ?",
      [id, req.user.id],
    );
    if (!result.affectedRows) {
      return res
        .status(404)
        .json({ status: "fail", message: "Address not found." });
    }
    res.status(200).json({ status: "success", message: "Address deleted." });
  } catch (err) {
    next(err);
  }
};

/* ── Reviews ─────────────────────────────── */

exports.addReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, title, body } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ status: "fail", message: "Rating (1–5) required." });
    }

    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ status: "fail", message: "Product not found." });

    const already = await Review.userReviewedProduct(req.user.id, productId);
    if (already) {
      return res.status(409).json({
        status: "fail",
        message: "You already reviewed this product.",
      });
    }

    const reviewId = await Review.create({
      productId,
      userId: req.user.id,
      rating,
      title,
      body,
    });
    await Product.updateRating(productId);

    const reviews = await Review.findByProduct(productId);
    res.status(201).json({ status: "success", data: { reviewId, reviews } });
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Review.delete(id, req.user.id);
    if (!deleted)
      return res
        .status(404)
        .json({ status: "fail", message: "Review not found." });

    res.status(200).json({ status: "success", message: "Review deleted." });
  } catch (err) {
    next(err);
  }
};
