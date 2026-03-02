/**
 * Integration guide for Real-time Events
 * 
 * This guide explains how to integrate the real-time event system into your controllers.
 * 
 * SETUP (already done in server.js):
 * 1. Socket.io is initialized on the server
 * 2. The io instance is attached to the express app as app.set("io", io)
 * 3. Clients connect and join rooms based on their role (admin, user-{id})
 * 
 * USAGE IN CONTROLLERS:
 * 
 * Example 1: Emit product update from productController
 * 
 *   const RealtimeEvents = require("../utils/realtimeEvents");
 *   
 *   exports.updateProduct = async (req, res, next) => {
 *     try {
 *       const io = req.app.get("io");
 *       const realtimeEvents = new RealtimeEvents(io);
 *       
 *       // ... your update logic ...
 *       
 *       // Emit the update to all connected clients
 *       realtimeEvents.emitProductUpdate("updated", updatedProduct);
 *       
 *       res.status(200).json({ status: "success", data: { product: updatedProduct } });
 *     } catch (err) {
 *       next(err);
 *     }
 *   };
 * 
 * Example 2: Emit order update from orderController
 * 
 *   exports.createOrder = async (req, res, next) => {
 *     try {
 *       const io = req.app.get("io");
 *       const realtimeEvents = new RealtimeEvents(io);
 *       
 *       // ... your order creation logic ...
 *       
 *       // Notify admin and the customer
 *       realtimeEvents.emitOrderUpdate("created", newOrder, userId);
 *       
 *       res.status(201).json({ status: "success", data: { order: newOrder } });
 *     } catch (err) {
 *       next(err);
 *     }
 *   };
 * 
 * Example 3: Emit cart update from cartController
 * 
 *   exports.updateCart = async (req, res, next) => {
 *     try {
 *       const io = req.app.get("io");
 *       const realtimeEvents = new RealtimeEvents(io);
 *       const userId = req.user.id;
 *       
 *       // ... your cart update logic ...
 *       
 *       realtimeEvents.emitCartUpdate(userId, updatedCart);
 *       
 *       res.status(200).json({ status: "success", data: { cart: updatedCart } });
 *     } catch (err) {
 *       next(err);
 *     }
 *   };
 * 
 * AVAILABLE EVENTS:
 * 
 * 1. emitProductUpdate(eventType, product)
 *    - eventType: 'created', 'updated', 'deleted', 'stock-changed'
 *    - Broadcasts to all clients and admin panel
 * 
 * 2. emitOrderUpdate(eventType, order, userId)
 *    - eventType: 'created', 'updated', 'status-changed', 'cancelled'
 *    - Notifies admin and the specific user
 * 
 * 3. emitUserUpdate(eventType, user)
 *    - eventType: 'login', 'registered', 'status-changed', 'deleted'
 *    - Notifies admin panel only
 * 
 * 4. emitCartUpdate(userId, cartData)
 *    - Notifies specific user of cart changes
 * 
 * 5. emitWishlistUpdate(userId, wishlistData)
 *    - Notifies specific user of wishlist changes
 * 
 * 6. emitCouponUpdate(eventType, coupon)
 *    - eventType: 'created', 'updated', 'expired'
 *    - Broadcasts to all users and admin
 * 
 * 7. emitDashboardUpdate(stats)
 *    - Notifies admin panel with updated dashboard stats
 * 
 * 8. broadcast(room, event, data)
 *    - Custom broadcast to specific room
 * 
 * CLIENT-SIDE EVENTS (Frontend listens for):
 * 
 * 1. product:update - Product changed
 * 2. order:update - Order changed for specific user
 * 3. cart:update - Cart changed for specific user
 * 4. wishlist:update - Wishlist changed for specific user
 * 5. coupon:update - Coupon/promotion changed
 * 6. admin:product-update - Admin notification of product change
 * 7. admin:order-update - Admin notification of order change
 * 8. admin:user-update - Admin notification of user change
 * 9. admin:dashboard-update - Admin dashboard stats updated
 * 10. admin:coupon-update - Admin notification of coupon change
 * 
 * NEXT STEPS:
 * 
 * 1. Update productController.js to emit events when products are created/updated/deleted
 * 2. Update orderController.js to emit events when orders are created/updated
 * 3. Update cartController.js to emit events when cart is updated
 * 4. Update userController.js to emit user events
 * 5. Update wishlistController.js to emit wishlist events
 * 6. Test the real-time updates by using the admin panel and opening the shop in another window
 */

console.log("Real-time events integration guide loaded");
