/**
 * routes/cartRoutes.js
 * All routes require authentication.
 *
 * GET    /api/v1/cart
 * POST   /api/v1/cart
 * PATCH  /api/v1/cart
 * DELETE /api/v1/cart         (clear entire cart)
 * DELETE /api/v1/cart/:productId
 */

const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

router.use(protect);

router.get("/", getCart);
router.post("/", addToCart);
router.patch("/", updateCart);
router.delete("/", clearCart);
router.delete("/:productId", removeFromCart);

module.exports = router;
