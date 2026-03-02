/**
 * routes/adminRoutes.js
 * All routes require protect + adminOnly middleware.
 *
 * GET    /api/v1/admin/dashboard
 *
 * GET    /api/v1/admin/users
 * PATCH  /api/v1/admin/users/:id/toggle
 *
 * GET    /api/v1/admin/products
 * POST   /api/v1/admin/products
 * PUT    /api/v1/admin/products/:id
 * DELETE /api/v1/admin/products/:id
 *
 * GET    /api/v1/admin/orders
 * GET    /api/v1/admin/orders/:id
 * PATCH  /api/v1/admin/orders/:id/status
 *
 * GET    /api/v1/admin/coupons
 * POST   /api/v1/admin/coupons
 * PATCH  /api/v1/admin/coupons/:id/toggle
 */

const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/adminAuth");
const {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getAllCoupons,
  createCoupon,
  toggleCoupon,
} = require("../controllers/adminController");

// Product image upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "../public/images")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product-${Date.now()}${ext}`);
  },
});
const uploadProduct = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    /\.(jpe?g|png|webp)$/i.test(file.originalname)
      ? cb(null, true)
      : cb(new Error("Images only."));
  },
}).single("image");

const upload = (req, res, next) =>
  uploadProduct(req, res, (err) => {
    if (err)
      return res.status(400).json({ status: "fail", message: err.message });
    next();
  });

router.use(protect, adminOnly);

// Dashboard
router.get("/dashboard", getDashboardStats);

// Users
router.get("/users", getAllUsers);
router.patch("/users/:id/toggle", toggleUserStatus);

// Products
router.get("/products", getAllProducts);
router.post("/products", upload, createProduct);
router.put("/products/:id", upload, updateProduct);
router.delete("/products/:id", deleteProduct);

// Orders
router.get("/orders", getAllOrders);
router.get("/orders/:id", getOrderById);
router.patch("/orders/:id/status", updateOrderStatus);

// Coupons
router.get("/coupons", getAllCoupons);
router.post("/coupons", createCoupon);
router.patch("/coupons/:id/toggle", toggleCoupon);

module.exports = router;
