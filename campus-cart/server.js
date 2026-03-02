/**
 * server.js — CampusCart Express application entry point
 *
 * Startup sequence:
 *   1. Load env variables (.env)
 *   2. Connect to MySQL (exits on failure)
 *   3. Apply global middleware
 *   4. Mount API routes under /api/v1/
 *   5. Serve static frontend files from /pages & /public
 *   6. Attach 404 and global error handlers
 *   7. Start listening on PORT
 */

require("dotenv").config();

const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const http = require("http");
const socketIO = require("socket.io");

const { testConnection } = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

/* ── Route modules ──────────────────────────────────── */
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

/* ─────────────────────────────────────────────────────
   App initialisation
───────────────────────────────────────────────────── */
const app = express();
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || "development";

/* ── Security & parsing ─────────────────────────────── */
app.use(
  helmet({
    contentSecurityPolicy: false, // relax CSP so existing HTML/CSS loads fine
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(
  cors({
    origin: ENV === "production" ? process.env.CLIENT_ORIGIN || false : true,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

/* ── Logging ─────────────────────────────────────────── */
if (ENV !== "test") {
  app.use(morgan(ENV === "development" ? "dev" : "combined"));
}

/* ── Global rate‑limit (all /api routes) ─────────────── */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many requests — please try again later.",
  },
});
app.use("/api", apiLimiter);

/* ── Stricter limiter for auth endpoints ─────────────── */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    status: "fail",
    message: "Too many login attempts — try again in 15 minutes.",
  },
});
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);

/* ── Static files ───────────────────────────────────── */
// Serve uploaded product images & avatars
app.use("/images", express.static(path.join(__dirname, "public", "images")));
// Serve shared JS utilities
app.use("/js", express.static(path.join(__dirname, "public", "js")));
// Serve existing CSS
app.use("/css", express.static(path.join(__dirname, "css")));
// Serve original images folder (existing site assets)
app.use("/assets", express.static(path.join(__dirname, "images")));

/* ── API routes ─────────────────────────────────────── */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/admin", adminRoutes);

/* ── Health check ───────────────────────────────────── */
app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ status: "ok", env: ENV, uptime: process.uptime() });
});

/* ── Frontend pages — clean URLs (no .html) ─────────── */

// Redirect any request ending in .html to its clean URL equivalent
// e.g. /shop.html → /shop,  /index.html → /
app.use((req, res, next) => {
  if (req.path.endsWith(".html")) {
    const clean = req.path.slice(0, -5); // strip ".html"
    const target = clean === "/index" || clean === "" ? "/" : clean;
    const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    return res.redirect(301, target + qs);
  }
  next();
});

// Explicit clean-URL routes for every page
const pages = [
  "shop",
  "cart",
  "wishlist",
  "login",
  "register",
  "profile",
  "contact",
  "about",
  "shop-fashion",
  "shop-stationery",
  "shop-backpacks",
  "shop-accessories",
  "shop-mens-accessories",
  "product-details",
  "admin",
];

for (const page of pages) {
  app.get(`/${page}`, (_req, res) => {
    res.sendFile(path.join(__dirname, "pages", `${page}.html`));
  });
}

// Root → home
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

/* ── Error handling ─────────────────────────────────── */
app.use(notFound);
app.use(errorHandler);

/* ─────────────────────────────────────────────────────
   Bootstrap: connect to DB then start server
───────────────────────────────────────────────────── */
(async () => {
  await testConnection(); // exits process if DB unreachable

  // Create HTTP server for Socket.io
  const server = http.createServer(app);

  // Initialize Socket.io with CORS support
  const io = socketIO(server, {
    cors: {
      origin: ENV === "production" ? process.env.CLIENT_ORIGIN || false : true,
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Store io instance globally for access in controllers
  app.set("io", io);

  // Socket.io event handlers
  io.on("connection", (socket) => {
    console.log(`✓ Client connected: ${socket.id}`);

    // Join rooms based on user role
    socket.on("join-room", (data) => {
      const { role, userId } = data;
      if (role === "admin") {
        socket.join("admin-panel");
        console.log(`Admin ${userId} joined admin panel`);
      } else {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined personal room`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`✗ Client disconnected: ${socket.id}`);
    });
  });

  server.listen(PORT, () => {
    console.log(
      `\n🚀  CampusCart API running in ${ENV} mode on http://localhost:${PORT}`,
    );
    console.log(`   Frontend  → http://localhost:${PORT}/`);
    console.log(`   API       → http://localhost:${PORT}/api/v1/`);
    console.log(`   Health    → http://localhost:${PORT}/api/v1/health`);
    console.log(`   WebSocket → ws://localhost:${PORT}\n`);
  });

  /* Graceful shutdown */
  const shutdown = (signal) => {
    console.log(`\n${signal} received — closing server…`);
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
})();

module.exports = app; // exported for testing
