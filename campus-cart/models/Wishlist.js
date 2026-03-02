/**
 * models/Wishlist.js
 * Queries related to the `wishlist` table.
 */

const { pool } = require("../config/db");

const Wishlist = {
  async findByUser(userId) {
    const [rows] = await pool.query(
      `SELECT w.id, w.created_at,
              p.id AS product_id, p.name, p.price, p.original_price,
              p.image, p.stock, p.status, p.badge, p.category, p.rating, p.review_count
         FROM wishlist w
         JOIN products p ON w.product_id = p.id
        WHERE w.user_id = ?
        ORDER BY w.created_at DESC`,
      [userId],
    );
    return rows;
  },

  async countByUser(userId) {
    const [[{ count }]] = await pool.query(
      "SELECT COUNT(*) AS count FROM wishlist WHERE user_id = ?",
      [userId],
    );
    return count;
  },

  async exists(userId, productId) {
    const [rows] = await pool.query(
      "SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?",
      [userId, productId],
    );
    return rows.length > 0;
  },

  async add(userId, productId) {
    await pool.query(
      "INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?,?)",
      [userId, productId],
    );
  },

  async remove(userId, productId) {
    const [result] = await pool.query(
      "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?",
      [userId, productId],
    );
    return result.affectedRows > 0;
  },

  /** Toggle: add if not present, remove if present. Returns the new state. */
  async toggle(userId, productId) {
    const present = await this.exists(userId, productId);
    if (present) {
      await this.remove(userId, productId);
      return false; // removed
    } else {
      await this.add(userId, productId);
      return true; // added
    }
  },
};

module.exports = Wishlist;
