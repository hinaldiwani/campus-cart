/**
 * controllers/productController.js
 * Public product endpoints.
 */

const Product = require("../models/Product");

exports.getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sort = "created_at",
      order = "DESC",
      minPrice,
      maxPrice,
    } = req.query;

    const result = await Product.findAll({
      page: +page,
      limit: +limit,
      category,
      search,
      sort,
      order,
      minPrice: minPrice ? +minPrice : null,
      maxPrice: maxPrice ? +maxPrice : null,
    });

    res.status(200).json({ status: "success", ...result });
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ status: "fail", message: "Product not found." });
    }
    res.status(200).json({ status: "success", data: { product } });
  } catch (err) {
    next(err);
  }
};

exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;
    const products = await Product.findFeatured(+limit);
    res
      .status(200)
      .json({
        status: "success",
        results: products.length,
        data: { products },
      });
  } catch (err) {
    next(err);
  }
};

exports.getByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const {
      page = 1,
      limit = 12,
      sort = "created_at",
      order = "DESC",
    } = req.query;
    const result = await Product.findAll({
      page: +page,
      limit: +limit,
      category,
      sort,
      order,
    });
    res.status(200).json({ status: "success", ...result });
  } catch (err) {
    next(err);
  }
};

exports.searchProducts = async (req, res, next) => {
  try {
    const { q = "", page = 1, limit = 12 } = req.query;
    if (!q.trim()) {
      return res
        .status(400)
        .json({ status: "fail", message: "Search query required." });
    }
    const result = await Product.findAll({
      search: q.trim(),
      page: +page,
      limit: +limit,
    });
    res.status(200).json({ status: "success", ...result });
  } catch (err) {
    next(err);
  }
};

exports.getCategoryCounts = async (_req, res, next) => {
  try {
    const counts = await Product.getCategoryCounts();
    res.status(200).json({ status: "success", data: { counts } });
  } catch (err) {
    next(err);
  }
};
