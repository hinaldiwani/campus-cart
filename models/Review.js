/**
 * models/Review.js
 * Queries related to the `reviews` table.
 */

const { pool } = require("../config/db");

const Review = {
  async findByProduct(productId, { page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      `SELECT r.*, u.name AS reviewer_name, u.avatar AS reviewer_avatar
         FROM reviews r
         JOIN users u ON r.user_id = u.id
        WHERE r.product_id = ?
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?`,
      [productId, limit, offset],
    );
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM reviews WHERE product_id = ?",
      [productId],
    );
    return { reviews: rows, total };
  },

  async findByUser(userId) {
    const [rows] = await pool.query(
      `SELECT r.*, p.name AS product_name, p.image AS product_image
         FROM reviews r
         JOIN products p ON r.product_id = p.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC`,
      [userId],
    );
    return rows;
  },

  async userReviewedProduct(userId, productId) {
    const [rows] = await pool.query(
      "SELECT id FROM reviews WHERE user_id = ? AND product_id = ?",
      [userId, productId],
    );
    return rows.length > 0;
  },

  async create({ productId, userId, rating, title = null, body = null }) {
    const [result] = await pool.query(
      "INSERT INTO reviews (product_id, user_id, rating, title, body) VALUES (?,?,?,?,?)",
      [productId, userId, rating, title, body],
    );
    return result.insertId;
  },

  async delete(id, userId) {
    const [result] = await pool.query(
      "DELETE FROM reviews WHERE id = ? AND user_id = ?",
      [id, userId],
    );
    return result.affectedRows > 0;
  },
};

module.exports = Review;
