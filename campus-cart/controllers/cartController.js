/**
 * controllers/cartController.js
 * Authenticated cart operations.
 */

const Cart = require("../models/Cart");
const Product = require("../models/Product");
const RealtimeEvents = require("../utils/realtimeEvents");

exports.getCart = async (req, res, next) => {
  try {
    const summary = await Cart.getCartSummary(req.user.id);
    res.status(200).json({ status: "success", data: summary });
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity < 1) {
      return res
        .status(400)
        .json({
          status: "fail",
          message: "productId and quantity (≥1) required.",
        });
    }

    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ status: "fail", message: "Product not found." });
    if (product.status !== "active") {
      return res
        .status(400)
        .json({ status: "fail", message: "Product is not available." });
    }
    if (product.stock < quantity) {
      return res
        .status(400)
        .json({ status: "fail", message: `Only ${product.stock} in stock.` });
    }

    await Cart.upsert(req.user.id, productId, quantity);
    const summary = await Cart.getCartSummary(req.user.id);

    // Emit real-time event
    const io = req.app.get("io");
    if (io) {
      const realtimeEvents = new RealtimeEvents(io);
      realtimeEvents.emitCartUpdate(req.user.id, summary);
    }

    res
      .status(200)
      .json({ status: "success", message: "Added to cart.", data: summary });
  } catch (err) {
    next(err);
  }
};

exports.updateCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res
        .status(400)
        .json({ status: "fail", message: "productId and quantity required." });
    }

    if (quantity < 1) {
      await Cart.removeItem(req.user.id, productId);
    } else {
      const product = await Product.findById(productId);
      if (!product)
        return res
          .status(404)
          .json({ status: "fail", message: "Product not found." });
      if (product.stock < quantity) {
        return res
          .status(400)
          .json({ status: "fail", message: `Only ${product.stock} in stock.` });
      }
      await Cart.updateQuantity(req.user.id, productId, quantity);
    }

    const summary = await Cart.getCartSummary(req.user.id);

    // Emit real-time event
    const io = req.app.get("io");
    if (io) {
      const realtimeEvents = new RealtimeEvents(io);
      realtimeEvents.emitCartUpdate(req.user.id, summary);
    }

    res.status(200).json({ status: "success", data: summary });
  } catch (err) {
    next(err);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    await Cart.removeItem(req.user.id, +productId);
    const summary = await Cart.getCartSummary(req.user.id);

    // Emit real-time event
    const io = req.app.get("io");
    if (io) {
      const realtimeEvents = new RealtimeEvents(io);
      realtimeEvents.emitCartUpdate(req.user.id, summary);
    }

    res
      .status(200)
      .json({ status: "success", message: "Item removed.", data: summary });
  } catch (err) {
    next(err);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    await Cart.clearCart(req.user.id);

    // Emit real-time event
    const io = req.app.get("io");
    if (io) {
      const realtimeEvents = new RealtimeEvents(io);
      realtimeEvents.emitCartUpdate(req.user.id, { items: [] });
    }

    res.status(200).json({ status: "success", message: "Cart cleared." });
  } catch (err) {
    next(err);
  }
};
