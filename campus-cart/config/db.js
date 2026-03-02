const mysql = require("mysql2/promise");
require("dotenv").config();

// Create a connection pool (reuses connections — best practice for production)
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "campuscart",
  waitForConnections: true,
  connectionLimit: 10, // max simultaneous connections
  queueLimit: 0, // unlimited queued requests
  timezone: "+05:30", // IST
  charset: "utf8mb4",
});

// Verify connectivity at startup
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log("✅  MySQL connected — host:", process.env.DB_HOST);
    conn.release();
  } catch (err) {
    console.error("❌  MySQL connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = { pool, testConnection };
