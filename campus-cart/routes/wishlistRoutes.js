/**
 * routes/wishlistRoutes.js
 * All routes require authentication.
 *
 * GET  /api/v1/wishlist
 * POST /api/v1/wishlist/toggle
 * POST /api/v1/wishlist/move-to-cart
 */

const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const {
  getWishlist,
  toggle,
  moveToCart,
} = require("../controllers/wishlistController");

router.use(protect);

router.get("/", getWishlist);
router.post("/toggle", toggle);
router.post("/move-to-cart", moveToCart);

module.exports = router;
