/**
 * database/setup.js
 * Run once:  node database/setup.js
 * Creates the DB + all tables from schema.sql
 */

const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

async function setup() {
  // Connect WITHOUT a database selected first, so we can create it
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });

  console.log("📦  Running schema…");
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await conn.query(sql);
  console.log("✅  Schema applied successfully.");

  await conn.end();
  console.log("   Run  node database/seed.js  to populate sample data.");
}

setup().catch((err) => {
  console.error("❌  Setup failed:", err.message);
  process.exit(1);
});
