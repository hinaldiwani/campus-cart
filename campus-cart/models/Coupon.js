/**
 * models/Coupon.js
 * Queries related to the `coupons` table.
 */

const { pool } = require("../config/db");

const Coupon = {
  async findByCode(code) {
    const [rows] = await pool.query(
      "SELECT * FROM coupons WHERE code = ? AND is_active = 1",
      [code.toUpperCase()],
    );
    return rows[0] || null;
  },

  async findAll({ page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      "SELECT * FROM coupons ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [limit, offset],
    );
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM coupons",
    );
    return { coupons: rows, total };
  },

  /**
   * Validate coupon against a given order subtotal.
   * Returns { valid, discount, message }.
   */
  async validate(code, subtotal) {
    const coupon = await this.findByCode(code);
    if (!coupon)
      return { valid: false, discount: 0, message: "Coupon not found." };

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return { valid: false, discount: 0, message: "Coupon has expired." };
    }

    if (
      coupon.usage_limit !== null &&
      coupon.used_count >= coupon.usage_limit
    ) {
      return {
        valid: false,
        discount: 0,
        message: "Coupon usage limit reached.",
      };
    }

    if (subtotal < coupon.min_order) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order of ₹${coupon.min_order} required for this coupon.`,
      };
    }

    let discount = 0;
    if (coupon.type === "percent") {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.max_discount)
        discount = Math.min(discount, coupon.max_discount);
    } else {
      discount = coupon.value;
    }

    discount = Math.min(discount, subtotal);

    return { valid: true, discount: Math.round(discount * 100) / 100, coupon };
  },

  async incrementUsage(code) {
    await pool.query(
      "UPDATE coupons SET used_count = used_count + 1 WHERE code = ?",
      [code.toUpperCase()],
    );
  },

  async create({
    code,
    type,
    value,
    min_order = 0,
    max_discount = null,
    usage_limit = null,
    expires_at = null,
  }) {
    const [result] = await pool.query(
      `INSERT INTO coupons (code, type, value, min_order, max_discount, usage_limit, expires_at)
       VALUES (?,?,?,?,?,?,?)`,
      [
        code.toUpperCase(),
        type,
        value,
        min_order,
        max_discount,
        usage_limit,
        expires_at,
      ],
    );
    return result.insertId;
  },

  async toggleActive(id) {
    await pool.query(
      "UPDATE coupons SET is_active = NOT is_active WHERE id = ?",
      [id],
    );
  },
};

module.exports = Coupon;
