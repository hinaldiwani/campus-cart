/**
 * models/Product.js
 * All SQL queries related to the `products` table.
 */

const { pool } = require("../config/db");

const Product = {
  /* ── Finders ─────────────────────────────────── */

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE id = ? AND status != "inactive"',
      [id],
    );
    return rows[0] || null;
  },

  async findAll({
    page = 1,
    limit = 12,
    category = null,
    search = "",
    sort = "created_at",
    order = "DESC",
    minPrice = null,
    maxPrice = null,
    featured = null,
    status = "active",
  } = {}) {
    const offset = (page - 1) * limit;
    const conditions = ["p.status = ?"];
    const params = [status];

    if (category) {
      conditions.push("p.category = ?");
      params.push(category);
    }
    if (search) {
      conditions.push("p.name LIKE ?");
      params.push(`%${search}%`);
    }
    if (minPrice) {
      conditions.push("p.price >= ?");
      params.push(minPrice);
    }
    if (maxPrice) {
      conditions.push("p.price <= ?");
      params.push(maxPrice);
    }
    if (featured !== null) {
      conditions.push("p.featured = ?");
      params.push(featured ? 1 : 0);
    }

    // Whitelist sort columns to prevent SQL injection
    const ALLOWED_SORTS = [
      "created_at",
      "price",
      "rating",
      "review_count",
      "name",
    ];
    const safeSort = ALLOWED_SORTS.includes(sort) ? sort : "created_at";
    const safeOrder = order === "ASC" ? "ASC" : "DESC";

    const whereClause = conditions.join(" AND ");

    const [rows] = await pool.query(
      `SELECT * FROM products p WHERE ${whereClause}
       ORDER BY p.${safeSort} ${safeOrder}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM products p WHERE ${whereClause}`,
      params,
    );

    return {
      products: rows,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  },

  async findFeatured(limit = 8) {
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE featured = 1 AND status = "active" ORDER BY created_at DESC LIMIT ?',
      [limit],
    );
    return rows;
  },

  async findByCategory(category, limit = 12) {
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE category = ? AND status = "active" ORDER BY created_at DESC LIMIT ?',
      [category, limit],
    );
    return rows;
  },

  /* ── Stats ───────────────────────────────────── */

  async getCategoryCounts() {
    const [rows] = await pool.query(
      `SELECT category, COUNT(*) AS count
         FROM products WHERE status = 'active'
        GROUP BY category`,
    );
    return rows; // [{ category: 'fashion', count: 4 }, …]
  },

  /* ── Mutations ───────────────────────────────── */

  async create({
    name,
    description = null,
    category,
    price,
    original_price = null,
    stock = 0,
    image = null,
    badge = null,
    rating = 5.0,
    review_count = 0,
    sku = null,
    featured = 0,
    status = "active",
  }) {
    const [result] = await pool.query(
      `INSERT INTO products
         (name, description, category, price, original_price, stock,
          image, badge, rating, review_count, sku, featured, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        name,
        description,
        category,
        price,
        original_price,
        stock,
        image,
        badge,
        rating,
        review_count,
        sku,
        featured,
        status,
      ],
    );
    return result.insertId;
  },

  async update(id, fields) {
    const allowed = [
      "name",
      "description",
      "category",
      "price",
      "original_price",
      "stock",
      "image",
      "badge",
      "featured",
      "status",
      "sku",
    ];
    const setClauses = [];
    const params = [];

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        setClauses.push(`${key} = ?`);
        params.push(fields[key]);
      }
    }

    if (!setClauses.length) return false;
    params.push(id);

    const [result] = await pool.query(
      `UPDATE products SET ${setClauses.join(", ")} WHERE id = ?`,
      params,
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    // Soft-delete by setting status = 'inactive'
    const [result] = await pool.query(
      "UPDATE products SET status = 'inactive' WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  },

  async decrementStock(id, qty, conn = pool) {
    const [result] = await conn.query(
      "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?",
      [qty, id, qty],
    );
    return result.affectedRows > 0; // false = out of stock
  },

  async incrementStock(id, qty, conn = pool) {
    await conn.query("UPDATE products SET stock = stock + ? WHERE id = ?", [
      qty,
      id,
    ]);
  },

  async updateRating(id) {
    // Recalculate rating from reviews table
    await pool.query(
      `UPDATE products p
         SET p.rating       = (SELECT COALESCE(AVG(r.rating), 5) FROM reviews r WHERE r.product_id = p.id),
             p.review_count = (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id)
       WHERE p.id = ?`,
      [id],
    );
  },
};

module.exports = Product;
