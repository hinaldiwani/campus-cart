/**
 * models/Cart.js
 * Queries related to the `cart` table.
 */

const { pool } = require("../config/db");

const Cart = {
  /** Return all cart items for a user, joined with product details */
  async findByUser(userId) {
    const [rows] = await pool.query(
      `SELECT c.id, c.quantity,
              p.id AS product_id, p.name, p.price, p.original_price,
              p.image, p.stock, p.status, p.badge,
              (p.price * c.quantity) AS item_total
         FROM cart c
         JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC`,
      [userId],
    );
    return rows;
  },

  /** Count distinct items in the cart */
  async countByUser(userId) {
    const [[{ count }]] = await pool.query(
      "SELECT COUNT(*) AS count FROM cart WHERE user_id = ?",
      [userId],
    );
    return count;
  },

  async findItem(userId, productId) {
    const [rows] = await pool.query(
      "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
      [userId, productId],
    );
    return rows[0] || null;
  },

  async upsert(userId, productId, quantity) {
    // Insert or update quantity (MySQL ON DUPLICATE KEY UPDATE)
    await pool.query(
      `INSERT INTO cart (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = ?`,
      [userId, productId, quantity, quantity],
    );
  },

  async updateQuantity(userId, productId, quantity) {
    const [result] = await pool.query(
      "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?",
      [quantity, userId, productId],
    );
    return result.affectedRows > 0;
  },

  async removeItem(userId, productId) {
    const [result] = await pool.query(
      "DELETE FROM cart WHERE user_id = ? AND product_id = ?",
      [userId, productId],
    );
    return result.affectedRows > 0;
  },

  async clearCart(userId) {
    await pool.query("DELETE FROM cart WHERE user_id = ?", [userId]);
  },

  /** Compute totals (subtotal, savings) for a user's cart */
  async getCartSummary(userId) {
    const items = await this.findByUser(userId);
    let subtotal = 0;
    let savings = 0;

    for (const item of items) {
      subtotal += item.price * item.quantity;
      if (item.original_price) {
        savings += (item.original_price - item.price) * item.quantity;
      }
    }

    const shippingFee = subtotal > 999 ? 0 : 49;
    const total = subtotal + shippingFee;

    return {
      items,
      subtotal,
      savings,
      shippingFee,
      total,
      itemCount: items.length,
    };
  },
};

module.exports = Cart;
