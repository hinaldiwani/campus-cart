/**
 * utils/realtimeEvents.js
 * Real-time event emitter for broadcasting data changes to frontend and admin
 */

class RealtimeEvents {
    constructor(io) {
        this.io = io;
    }

    /**
     * Emit product update to all connected clients
     * @param {string} eventType - 'created', 'updated', 'deleted', 'stock-changed'
     * @param {object} product - Product data
     */
    emitProductUpdate(eventType, product) {
        if (!this.io) return;

        this.io.emit("product:update", {
            type: eventType,
            product,
            timestamp: new Date(),
        });

        // Also notify admin specifically
        this.io.to("admin-panel").emit("admin:product-update", {
            type: eventType,
            product,
            timestamp: new Date(),
        });
    }

    /**
     * Emit order update to admin and relevant user
     * @param {string} eventType - 'created', 'updated', 'status-changed', 'cancelled'
     * @param {object} order - Order data
     * @param {number} userId - User ID for personal notification
     */
    emitOrderUpdate(eventType, order, userId) {
        if (!this.io) return;

        // Notify admin
        this.io.to("admin-panel").emit("admin:order-update", {
            type: eventType,
            order,
            timestamp: new Date(),
        });

        // Notify specific user
        if (userId) {
            this.io.to(`user-${userId}`).emit("order:update", {
                type: eventType,
                order,
                timestamp: new Date(),
            });
        }
    }

    /**
     * Emit user activity to admin
     * @param {string} eventType - 'login', 'registered', 'status-changed', 'deleted'
     * @param {object} user - User data
     */
    emitUserUpdate(eventType, user) {
        if (!this.io) return;

        this.io.to("admin-panel").emit("admin:user-update", {
            type: eventType,
            user,
            timestamp: new Date(),
        });
    }

    /**
     * Emit cart update to user
     * @param {number} userId - User ID
     * @param {object} cartData - Cart data
     */
    emitCartUpdate(userId, cartData) {
        if (!this.io) return;

        this.io.to(`user-${userId}`).emit("cart:update", {
            cartData,
            timestamp: new Date(),
        });
    }

    /**
     * Emit wishlist update to user
     * @param {number} userId - User ID
     * @param {object} wishlistData - Wishlist data
     */
    emitWishlistUpdate(userId, wishlistData) {
        if (!this.io) return;

        this.io.to(`user-${userId}`).emit("wishlist:update", {
            wishlistData,
            timestamp: new Date(),
        });
    }

    /**
     * Emit coupon/promotion update to all users
     * @param {string} eventType - 'created', 'updated', 'expired'
     * @param {object} coupon - Coupon data
     */
    emitCouponUpdate(eventType, coupon) {
        if (!this.io) return;

        this.io.emit("coupon:update", {
            type: eventType,
            coupon,
            timestamp: new Date(),
        });

        // Also notify admin
        this.io.to("admin-panel").emit("admin:coupon-update", {
            type: eventType,
            coupon,
            timestamp: new Date(),
        });
    }

    /**
     * Emit dashboard stats update to admin
     * @param {object} stats - Dashboard statistics
     */
    emitDashboardUpdate(stats) {
        if (!this.io) return;

        this.io.to("admin-panel").emit("admin:dashboard-update", {
            stats,
            timestamp: new Date(),
        });
    }

    /**
     * Broadcast a message to a specific room
     * @param {string} room - Room name
     * @param {string} event - Event name
     * @param {object} data - Data to send
     */
    broadcast(room, event, data) {
        if (!this.io) return;

        this.io.to(room).emit(event, {
            ...data,
            timestamp: new Date(),
        });
    }
}

module.exports = RealtimeEvents;
