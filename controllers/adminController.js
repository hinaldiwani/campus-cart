/**
 * controllers/adminController.js
 * Admin-only operations: dashboard stats, user/product/order management.
 */

const { pool } = require("../config/db");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");

/* ── Dashboard ───────────────────────────── */

exports.getDashboardStats = async (_req, res, next) => {
  try {
    const [[userStats]] = await pool.query(
      'SELECT COUNT(*) AS totalUsers, SUM(is_active = 1) AS activeUsers FROM users WHERE role = "user"',
    );
    const orderStats = await Order.getStats();
    const categoryCounts = await Product.getCategoryCounts();
    const [[productStats]] = await pool.query(
      'SELECT COUNT(*) AS total, SUM(stock = 0) AS outOfStock FROM products WHERE status = "active"',
    );

    // Revenue for last 7 days
    const [revenueRows] = await pool.query(
      `SELECT DATE(created_at) AS day, SUM(total_amount) AS revenue
         FROM orders
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          AND status != 'cancelled'
        GROUP BY DATE(created_at)
        ORDER BY day`,
    );

    // Recent 5 orders
    const [recentOrders] = await pool.query(
      `SELECT o.id, o.order_number, o.status, o.total_amount, o.created_at,
              u.name AS customer_name
         FROM orders o
         JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC LIMIT 5`,
    );

    res.status(200).json({
      status: "success",
      data: {
        userStats,
        orderStats,
        productStats,
        categoryCounts,
        revenueRows,
        recentOrders,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ── Users ───────────────────────────────── */

exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const result = await User.findAll({ page: +page, limit: +limit, search });
    res.status(200).json({ status: "success", ...result });
  } catch (err) {
    next(err);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user)
      return res
        .status(404)
        .json({ status: "fail", message: "User not found." });
    if (user.role === "admin") {
      return res
        .status(403)
        .json({
          status: "fail",
          message: "Cannot deactivate an admin account.",
        });
    }
    await User.setActive(id, !user.is_active);
    res.status(200).json({
      status: "success",
      message: user.is_active ? "User deactivated." : "User activated.",
    });
  } catch (err) {
    next(err);
  }
};

/* ── Products ────────────────────────────── */

exports.getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category, status } = req.query;
    const result = await Product.findAll({
      page: +page,
      limit: +limit,
      search,
      category,
      status: status || "active",
    });
    res.status(200).json({ status: "success", ...result });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      price,
      original_price,
      stock = 0,
      badge,
      featured = 0,
      status = "active",
      sku,
    } = req.body;

    if (!name || !category || !price) {
      return res
        .status(400)
        .json({
          status: "fail",
          message: "name, category, and price are required.",
        });
    }

    const image = req.file
      ? `/images/${req.file.filename}`
      : req.body.image || null;

    const id = await Product.create({
      name,
      description,
      category,
      price,
      original_price,
      stock,
      image,
      badge,
      featured,
      status,
      sku,
    });
    const product = await Product.findById(id);
    res.status(201).json({ status: "success", data: { product } });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await Product.findById(id);
    if (!existing)
      return res
        .status(404)
        .json({ status: "fail", message: "Product not found." });

    if (req.file) req.body.image = `/images/${req.file.filename}`;

    const ok = await Product.update(id, req.body);
    if (!ok)
      return res
        .status(400)
        .json({ status: "fail", message: "Nothing to update." });

    const product = await Product.findById(id);
    res.status(200).json({ status: "success", data: { product } });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const deleted = await Product.delete(req.params.id);
    if (!deleted)
      return res
        .status(404)
        .json({ status: "fail", message: "Product not found." });
    res
      .status(200)
      .json({ status: "success", message: "Product deleted (soft)." });
  } catch (err) {
    next(err);
  }
};

/* ── Orders ──────────────────────────────── */

exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search = "" } = req.query;
    const result = await Order.findAll({
      page: +page,
      limit: +limit,
      status,
      search,
    });
    res.status(200).json({ status: "success", ...result });
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ status: "fail", message: "Order not found." });
    res.status(200).json({ status: "success", data: { order } });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({
          status: "fail",
          message: `Status must be one of: ${validStatuses.join(", ")}`,
        });
    }

    const ok = await Order.updateStatus(req.params.id, status);
    if (!ok)
      return res
        .status(404)
        .json({ status: "fail", message: "Order not found." });
    res
      .status(200)
      .json({
        status: "success",
        message: `Order status updated to "${status}".`,
      });
  } catch (err) {
    next(err);
  }
};

/* ── Coupons ─────────────────────────────── */

exports.getAllCoupons = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await Coupon.findAll({ page: +page, limit: +limit });
    res.status(200).json({ status: "success", ...result });
  } catch (err) {
    next(err);
  }
};

exports.createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      type,
      value,
      min_order,
      max_discount,
      usage_limit,
      expires_at,
    } = req.body;
    if (!code || !type || !value) {
      return res
        .status(400)
        .json({
          status: "fail",
          message: "code, type, and value are required.",
        });
    }
    const id = await Coupon.create({
      code,
      type,
      value,
      min_order,
      max_discount,
      usage_limit,
      expires_at,
    });
    res.status(201).json({ status: "success", data: { couponId: id } });
  } catch (err) {
    next(err);
  }
};

exports.toggleCoupon = async (req, res, next) => {
  try {
    await Coupon.toggleActive(req.params.id);
    res
      .status(200)
      .json({ status: "success", message: "Coupon status toggled." });
  } catch (err) {
    next(err);
  }
};
