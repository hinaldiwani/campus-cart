/**
 * models/User.js
 * All SQL queries related to the `users` table.
 */

const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

const User = {
  /* ── Finders ─────────────────────────────────── */

  async findById(id) {
    const [rows] = await pool.query(
      "SELECT id, name, email, college, phone, avatar, role, is_active, created_at FROM users WHERE id = ?",
      [id],
    );
    return rows[0] || null;
  },

  async findByEmail(email) {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0] || null;
  },

  async findAll({ page = 1, limit = 20, search = "" } = {}) {
    const offset = (page - 1) * limit;
    const like = `%${search}%`;
    const [rows] = await pool.query(
      `SELECT id, name, email, college, role, is_active, created_at
         FROM users
        WHERE name LIKE ? OR email LIKE ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?`,
      [like, like, limit, offset],
    );
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM users WHERE name LIKE ? OR email LIKE ?",
      [like, like],
    );
    return { users: rows, total, page, limit };
  },

  /* ── Mutations ───────────────────────────────── */

  async create({
    name,
    email,
    password,
    college = null,
    phone = null,
    role = "user",
  }) {
    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, college, phone, role) VALUES (?,?,?,?,?,?)",
      [name, email, hash, college, phone, role],
    );
    return result.insertId;
  },

  async update(id, { name, college, phone, email, avatar }) {
    const fields = [];
    const values = [];
    if (name !== undefined) {
      fields.push("name = ?");
      values.push(name);
    }
    if (college !== undefined) {
      fields.push("college = ?");
      values.push(college);
    }
    if (phone !== undefined) {
      fields.push("phone = ?");
      values.push(phone);
    }
    if (email !== undefined) {
      fields.push("email = ?");
      values.push(email);
    }
    if (avatar !== undefined) {
      fields.push("avatar = ?");
      values.push(avatar);
    }
    if (!fields.length) return;
    values.push(id);
    await pool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
  },

  async updatePassword(id, newPassword) {
    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [hash, id]);
  },

  async setActive(id, isActive) {
    await pool.query("UPDATE users SET is_active = ? WHERE id = ?", [
      isActive ? 1 : 0,
      id,
    ]);
  },

  /* ── Auth helpers ────────────────────────────── */

  async comparePassword(plaintext, hashed) {
    return bcrypt.compare(plaintext, hashed);
  },
};

module.exports = User;
