/**
 * controllers/wishlistController.js
 * Authenticated wishlist operations.
 */

const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

exports.getWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.findByUser(req.user.id);
    res
      .status(200)
      .json({ status: "success", results: items.length, data: { items } });
  } catch (err) {
    next(err);
  }
};

exports.toggle = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res
        .status(400)
        .json({ status: "fail", message: "productId required." });
    }

    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ status: "fail", message: "Product not found." });

    const added = await Wishlist.toggle(req.user.id, productId);
    const count = await Wishlist.countByUser(req.user.id);

    res.status(200).json({
      status: "success",
      message: added ? "Added to wishlist." : "Removed from wishlist.",
      data: { wishlisted: added, count },
    });
  } catch (err) {
    next(err);
  }
};

exports.moveToCart = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res
        .status(400)
        .json({ status: "fail", message: "productId required." });
    }

    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ status: "fail", message: "Product not found." });
    if (product.stock < 1) {
      return res
        .status(400)
        .json({ status: "fail", message: "Product is out of stock." });
    }

    await Cart.upsert(req.user.id, productId, 1);
    await Wishlist.remove(req.user.id, productId);

    res.status(200).json({ status: "success", message: "Moved to cart." });
  } catch (err) {
    next(err);
  }
};
