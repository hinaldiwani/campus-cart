/**
 * routes/productRoutes.js
 * GET /api/v1/products
 * GET /api/v1/products/featured
 * GET /api/v1/products/category/:category
 * GET /api/v1/products/search
 * GET /api/v1/products/categories/count
 * GET /api/v1/products/:id
 * GET /api/v1/products/:id/reviews
 */

const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  getByCategory,
  searchProducts,
  getCategoryCounts,
} = require("../controllers/productController");

const { pool } = require("../config/db");
const Review = require("../models/Review");

// Static routes BEFORE parameterised routes
router.get("/featured", getFeaturedProducts);
router.get("/search", searchProducts);
router.get("/categories/count", getCategoryCounts);
router.get("/category/:category", getByCategory);
router.get("/", getAllProducts);

// Dynamic — order matters
router.get("/:id", getProductById);

router.get("/:id/reviews", async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await Review.findByProduct(req.params.id, {
      page: +page,
      limit: +limit,
    });
    res.status(200).json({ status: "success", ...result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
