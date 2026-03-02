/**
 * models/Order.js
 * Queries related to the `orders` and `order_items` tables.
 */

const { pool } = require("../config/db");

const Order = {
  /* ── Finders ─────────────────────────────────── */

  async findById(id, userId = null) {
    const cond = userId ? "AND o.user_id = ?" : "";
    const params = userId ? [id, userId] : [id];

    const [rows] = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
         FROM orders o
         JOIN users u ON o.user_id = u.id
        WHERE o.id = ? ${cond}`,
      params,
    );
    if (!rows.length) return null;

    const order = rows[0];
    order.items = await this.getItems(id);
    return order;
  },

  async findByOrderNumber(orderNumber) {
    const [rows] = await pool.query(
      "SELECT * FROM orders WHERE order_number = ?",
      [orderNumber],
    );
    if (!rows.length) return null;
    const order = rows[0];
    order.items = await this.getItems(order.id);
    return order;
  },

  async findByUser(userId, { page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      `SELECT o.id, o.order_number, o.status, o.payment_status,
              o.total_amount, o.created_at,
              COUNT(oi.id) AS item_count
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT ? OFFSET ?`,
      [userId, limit, offset],
    );
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM orders WHERE user_id = ?",
      [userId],
    );
    return { orders: rows, total, page, limit };
  },

  async findAll({ page = 1, limit = 20, status = null, search = "" } = {}) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push("o.status = ?");
      params.push(status);
    }
    if (search) {
      conditions.push(
        "(o.order_number LIKE ? OR u.name LIKE ? OR u.email LIKE ?)",
      );
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

    const [rows] = await pool.query(
      `SELECT o.id, o.order_number, o.status, o.payment_status,
              o.total_amount, o.payment_method, o.created_at,
              u.name AS customer_name, u.email AS customer_email
         FROM orders o
         JOIN users u ON o.user_id = u.id
         ${where}
        ORDER BY o.created_at DESC
        LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM orders o JOIN users u ON o.user_id = u.id ${where}`,
      params,
    );

    return {
      orders: rows,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  },

  async getItems(orderId) {
    const [rows] = await pool.query(
      `SELECT oi.*, p.image AS product_image
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?`,
      [orderId],
    );
    return rows;
  },

  /* ── Creation (transactional) ────────────────── */

  /**
   * Create an order within a transaction.
   * @param {object} orderData  — order header fields
   * @param {Array}  items      — [{ product_id, name, image, price, quantity }]
   * @param {object} conn       — existing connection (for external transaction)
   */
  async createWithItems(orderData, items, conn = pool) {
    const number = await this.generateOrderNumber();

    const [result] = await conn.query(
      `INSERT INTO orders
         (order_number, user_id, shipping_address, subtotal, shipping_fee,
          discount, total_amount, payment_method, coupon_code, notes)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        number,
        orderData.userId,
        JSON.stringify(orderData.shippingAddress),
        orderData.subtotal,
        orderData.shippingFee,
        orderData.discount || 0,
        orderData.totalAmount,
        orderData.paymentMethod || "cod",
        orderData.couponCode || null,
        orderData.notes || null,
      ],
    );

    const orderId = result.insertId;

    for (const item of items) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, name, image, price, quantity, subtotal)
         VALUES (?,?,?,?,?,?,?)`,
        [
          orderId,
          item.product_id,
          item.name,
          item.image,
          item.price,
          item.quantity,
          item.price * item.quantity,
        ],
      );
    }

    return { orderId, orderNumber: number };
  },

  /* ── Mutations ───────────────────────────────── */

  async updateStatus(id, status) {
    const [result] = await pool.query(
      "UPDATE orders SET status = ? WHERE id = ?",
      [status, id],
    );
    return result.affectedRows > 0;
  },

  async updatePaymentStatus(id, paymentStatus) {
    const [result] = await pool.query(
      "UPDATE orders SET payment_status = ? WHERE id = ?",
      [paymentStatus, id],
    );
    return result.affectedRows > 0;
  },

  /* ── Helpers ─────────────────────────────────── */

  async generateOrderNumber() {
    const year = new Date().getFullYear();
    const [[{ n }]] = await pool.query(
      "SELECT COUNT(*) + 1 AS n FROM orders WHERE YEAR(created_at) = ?",
      [year],
    );
    return `ORD-${year}-${String(n).padStart(4, "0")}`;
  },

  /* ── Dashboard stats ─────────────────────────── */

  async getStats() {
    const [[stats]] = await pool.query(
      `SELECT
         COUNT(*)                                                  AS total_orders,
         SUM(total_amount)                                         AS total_revenue,
         SUM(CASE WHEN status = 'pending'   THEN 1 ELSE 0 END)    AS pending,
         SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END)    AS confirmed,
         SUM(CASE WHEN status = 'shipped'   THEN 1 ELSE 0 END)    AS shipped,
         SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)    AS delivered,
         SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)    AS cancelled
       FROM orders`,
    );
    return stats;
  },
};

module.exports = Order;
