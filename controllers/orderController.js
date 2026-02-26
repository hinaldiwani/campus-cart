/**
 * controllers/orderController.js
 * Place orders, view order history, apply coupons.
 */

const { pool } = require("../config/db");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");

exports.applyCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    if (!code)
      return res
        .status(400)
        .json({ status: "fail", message: "Coupon code required." });

    const result = await Coupon.validate(code, subtotal || 0);
    if (!result.valid) {
      return res.status(400).json({ status: "fail", message: result.message });
    }

    res.status(200).json({
      status: "success",
      data: { discount: result.discount, coupon: result.coupon },
    });
  } catch (err) {
    next(err);
  }
};

exports.createOrder = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      shippingAddress,
      paymentMethod = "cod",
      couponCode,
      notes,
    } = req.body;

    if (!shippingAddress) {
      return res
        .status(400)
        .json({ status: "fail", message: "shippingAddress is required." });
    }

    // 1. Fetch cart
    const cartSummary = await Cart.getCartSummary(req.user.id);
    if (!cartSummary.items.length) {
      return res
        .status(400)
        .json({ status: "fail", message: "Cart is empty." });
    }

    // 2. Validate coupon (if provided)
    let discount = 0;
    if (couponCode) {
      const couponResult = await Coupon.validate(
        couponCode,
        cartSummary.subtotal,
      );
      if (!couponResult.valid) {
        return res
          .status(400)
          .json({ status: "fail", message: couponResult.message });
      }
      discount = couponResult.discount;
    }

    // 3. Decrement stock for each cart item
    for (const item of cartSummary.items) {
      const ok = await Product.decrementStock(
        item.product_id,
        item.quantity,
        conn,
      );
      if (!ok) {
        await conn.rollback();
        return res.status(400).json({
          status: "fail",
          message: `"${item.name}" is out of stock or insufficient quantity.`,
        });
      }
    }

    // 4. Build order data
    const orderData = {
      userId: req.user.id,
      shippingAddress,
      subtotal: cartSummary.subtotal,
      shippingFee: cartSummary.shippingFee,
      discount,
      totalAmount: cartSummary.subtotal + cartSummary.shippingFee - discount,
      paymentMethod,
      couponCode: couponCode || null,
      notes,
    };

    const items = cartSummary.items.map((i) => ({
      product_id: i.product_id,
      name: i.name,
      image: i.image,
      price: i.price,
      quantity: i.quantity,
    }));

    // 5. Insert order + items
    const { orderId, orderNumber } = await Order.createWithItems(
      orderData,
      items,
      conn,
    );

    // 6. Increment coupon usage
    if (couponCode) await Coupon.incrementUsage(couponCode);

    // 7. Clear cart
    await Cart.clearCart(req.user.id);

    await conn.commit();

    const order = await Order.findById(orderId);
    res.status(201).json({
      status: "success",
      message: "Order placed successfully!",
      data: { order, orderNumber },
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await Order.findByUser(req.user.id, {
      page: +page,
      limit: +limit,
    });
    res.status(200).json({ status: "success", ...result });
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id, req.user.id);
    if (!order) {
      return res
        .status(404)
        .json({ status: "fail", message: "Order not found." });
    }
    res.status(200).json({ status: "success", data: { order } });
  } catch (err) {
    next(err);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id, req.user.id);
    if (!order) {
      return res
        .status(404)
        .json({ status: "fail", message: "Order not found." });
    }
    if (!["pending", "confirmed"].includes(order.status)) {
      return res
        .status(400)
        .json({
          status: "fail",
          message: "Order cannot be cancelled at this stage.",
        });
    }

    await Order.updateStatus(order.id, "cancelled");

    // Restore stock
    for (const item of order.items) {
      await Product.incrementStock(item.product_id, item.quantity);
    }

    res.status(200).json({ status: "success", message: "Order cancelled." });
  } catch (err) {
    next(err);
  }
};
