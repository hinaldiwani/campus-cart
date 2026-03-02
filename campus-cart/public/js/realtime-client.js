/**
 * public/js/realtime-client.js
 * Client-side Socket.io handler for real-time updates
 */

class RealtimeClient {
    constructor(options = {}) {
        this.socket = null;
        this.isConnected = false;
        this.userId = options.userId || null;
        this.userRole = options.userRole || "user";
        this.listeners = {};
        this.init();
    }

    /**
     * Initialize Socket.io connection
     */
    init() {
        try {
            // Socket.io will be available globally after including the script
            if (typeof io === "undefined") {
                console.error(
                    "Socket.io library not loaded. Make sure to include it in the page.",
                );
                return;
            }

            this.socket = io();

            this.socket.on("connect", () => {
                console.log("✓ Connected to real-time server");
                this.isConnected = true;

                // Join appropriate room based on role and user ID
                this.socket.emit("join-room", {
                    role: this.userRole,
                    userId: this.userId,
                });

                // Notify listeners of connection
                this.notify("connected", { isConnected: true });
            });

            this.socket.on("disconnect", () => {
                console.log("✗ Disconnected from real-time server");
                this.isConnected = false;
                this.notify("disconnected", { isConnected: false });
            });

            this.socket.on("connect_error", (error) => {
                console.error("Connection error:", error);
            });
        } catch (error) {
            console.error("Failed to initialize real-time client:", error);
        }
    }

    /**
     * Subscribe to real-time events
     * @param {string} event - Event name
     * @param {function} callback - Callback function
     */
    on(event, callback) {
        if (!this.socket) return;

        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }

        this.listeners[event].push(callback);

        // Also listen on socket for the event
        this.socket.on(event, callback);
    }

    /**
     * Unsubscribe from real-time events
     * @param {string} event - Event name
     * @param {function} callback - Callback function
     */
    off(event, callback) {
        if (!this.socket) return;

        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(
                (cb) => cb !== callback,
            );
        }

        this.socket.off(event, callback);
    }

    /**
     * Notify all listeners of a specific event
     * @param {string} event - Event name
     * @param {object} data - Event data
     */
    notify(event, data) {
        if (!this.listeners[event]) return;

        this.listeners[event].forEach((callback) => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in listener for ${event}:`, error);
            }
        });
    }

    /**
     * Disconnect from real-time server
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    /**
     * Check if connected to real-time server
     */
    isConnectedToServer() {
        return this.isConnected;
    }
}

// Export for use as module or global
if (typeof module !== "undefined" && module.exports) {
    module.exports = RealtimeClient;
}
