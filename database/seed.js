/**
 * database/seed.js
 * Run:  node database/seed.js
 * Populates the DB with the default admin user + all storefront products.
 */

const bcrypt = require("bcryptjs");
require("dotenv").config();

const { pool } = require("../config/db");

/* ──────────────────────────────────────────────
   Seed data
────────────────────────────────────────────── */

const ADMIN = {
  name: "Admin",
  email: process.env.ADMIN_EMAIL || "admin@campuscart.com",
  password: process.env.ADMIN_PASSWORD || "Admin@123",
  role: "admin",
  college: "CampusCart HQ",
};

const PRODUCTS = [
  // Backpacks
  {
    name: "College Backpack",
    category: "backpacks",
    description:
      "Durable 30L backpack with laptop compartment and multiple pockets.",
    price: 399,
    original_price: 699,
    stock: 48,
    image: "Bag.jpg",
    badge: "43% OFF",
    rating: 5.0,
    review_count: 156,
    sku: "BP-COL-001",
    featured: 1,
  },

  // Stationery
  {
    name: "Notebook Set (5 Pack)",
    category: "stationery",
    description:
      "Set of 5 ruled notebooks — 200 pages each, perfect for all subjects.",
    price: 299,
    original_price: null,
    stock: 120,
    image: "Set of Books.jpg",
    badge: null,
    rating: 5.0,
    review_count: 203,
    sku: "ST-NB-001",
    featured: 1,
  },
  {
    name: "Highlighter Set",
    category: "stationery",
    description:
      "Pack of 6 vibrant highlighters — ideal for notes and revision.",
    price: 199,
    original_price: null,
    stock: 200,
    image: "Highlighter.jpg",
    badge: null,
    rating: 5.0,
    review_count: 167,
    sku: "ST-HL-001",
    featured: 0,
  },
  {
    name: "Desk Organizer",
    category: "stationery",
    description: "Compact bamboo desk organizer with 5 compartments.",
    price: 449,
    original_price: null,
    stock: 60,
    image: "Desk oragainzer.jpg",
    badge: null,
    rating: 5.0,
    review_count: 134,
    sku: "ST-DO-001",
    featured: 0,
  },
  {
    name: "Water Bottle",
    category: "stationery",
    description: "BPA-free 750ml insulated stainless-steel bottle.",
    price: 249,
    original_price: null,
    stock: 75,
    image: "Water Bottles.jpg",
    badge: null,
    rating: 5.0,
    review_count: 145,
    sku: "ST-WB-001",
    featured: 1,
  },

  // Fashion
  {
    name: "Men's Formal Shirt",
    category: "fashion",
    description:
      "Slim-fit cotton formal shirt. Available in white and light blue.",
    price: 399,
    original_price: null,
    stock: 35,
    image: "Men's Formal Shirt.jpg",
    badge: null,
    rating: 5.0,
    review_count: 189,
    sku: "FA-MS-001",
    featured: 1,
  },
  {
    name: "Women's Formal Shirt",
    category: "fashion",
    description: "Elegant formal shirt for women. Wrinkle-resistant fabric.",
    price: 399,
    original_price: null,
    stock: 28,
    image: "Women's Formal Shirt.jpg",
    badge: null,
    rating: 5.0,
    review_count: 178,
    sku: "FA-WS-001",
    featured: 1,
  },
  {
    name: "Men's Formal Pant",
    category: "fashion",
    description: "Classic straight-fit formal pant. Comfortable all-day wear.",
    price: 449,
    original_price: null,
    stock: 42,
    image: "Men's Formal Pant.jpg",
    badge: null,
    rating: 5.0,
    review_count: 167,
    sku: "FA-MP-001",
    featured: 0,
  },
  {
    name: "Women's Formal Pant",
    category: "fashion",
    description:
      "High-waist formal pant with a flared bottom. Office-ready style.",
    price: 449,
    original_price: null,
    stock: 30,
    image: "Women's Formal Pant.jpg",
    badge: null,
    rating: 5.0,
    review_count: 198,
    sku: "FA-WP-001",
    featured: 0,
  },
];

const COUPON = {
  code: "CAMPUS10",
  type: "percent",
  value: 10,
  min_order: 299,
  max_discount: 150,
  usage_limit: 1000,
  is_active: 1,
};

/* ──────────────────────────────────────────────
   Run seed
────────────────────────────────────────────── */
async function seed() {
  console.log("🌱  Seeding database…");

  // 1. Admin user
  const hash = await bcrypt.hash(ADMIN.password, 12);
  const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [
    ADMIN.email,
  ]);
  if (existing.length === 0) {
    await pool.query(
      "INSERT INTO users (name, email, password, role, college) VALUES (?,?,?,?,?)",
      [ADMIN.name, ADMIN.email, hash, ADMIN.role, ADMIN.college],
    );
    console.log(`   ✔  Admin created — ${ADMIN.email} / ${ADMIN.password}`);
  } else {
    console.log("   ⚠  Admin already exists, skipping.");
  }

  // 2. Products
  for (const p of PRODUCTS) {
    const [ex] = await pool.query("SELECT id FROM products WHERE sku = ?", [
      p.sku,
    ]);
    if (ex.length === 0) {
      await pool.query(
        `INSERT INTO products
           (name, description, category, price, original_price, stock,
            image, badge, rating, review_count, sku, featured, status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'active')`,
        [
          p.name,
          p.description,
          p.category,
          p.price,
          p.original_price,
          p.stock,
          p.image,
          p.badge,
          p.rating,
          p.review_count,
          p.sku,
          p.featured,
        ],
      );
      console.log(`   ✔  Product: ${p.name}`);
    } else {
      console.log(`   ⚠  Product "${p.name}" already exists, skipping.`);
    }
  }

  // 3. Sample coupon
  const [exC] = await pool.query("SELECT id FROM coupons WHERE code = ?", [
    COUPON.code,
  ]);
  if (exC.length === 0) {
    await pool.query(
      `INSERT INTO coupons (code, type, value, min_order, max_discount, usage_limit, is_active)
       VALUES (?,?,?,?,?,?,?)`,
      [
        COUPON.code,
        COUPON.type,
        COUPON.value,
        COUPON.min_order,
        COUPON.max_discount,
        COUPON.usage_limit,
        COUPON.is_active,
      ],
    );
    console.log(`   ✔  Coupon: ${COUPON.code} (10% OFF, min ₹299)`);
  }

  console.log("\n✅  Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});
