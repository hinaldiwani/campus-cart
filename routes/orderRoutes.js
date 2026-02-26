/**
 * routes/orderRoutes.js
 * All routes require authentication.
 *
 * POST   /api/v1/orders/coupon          apply coupon preview
 * POST   /api/v1/orders                 place order
 * GET    /api/v1/orders                 list my orders
 * GET    /api/v1/orders/:id             get single order
 * PATCH  /api/v1/orders/:id/cancel      cancel order
 */

const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const {
  applyCoupon,
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} = require("../controllers/orderController");

router.use(protect);

router.post("/coupon", applyCoupon);
router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);
router.patch("/:id/cancel", cancelOrder);

module.exports = router;
