-- ============================================================
--  CampusCart — MySQL Schema
--  Run:  mysql -u root -p campuscart < database/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS campuscart
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE campuscart;

-- ────────────────────────────────────────────────────────────
-- 1. USERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120)   NOT NULL,
  email         VARCHAR(160)   NOT NULL UNIQUE,
  password      VARCHAR(255)   NOT NULL,
  college       VARCHAR(200)   DEFAULT NULL,
  phone         VARCHAR(20)    DEFAULT NULL,
  avatar        VARCHAR(255)   DEFAULT NULL,
  role          ENUM('user','admin') NOT NULL DEFAULT 'user',
  is_active     TINYINT(1)     NOT NULL DEFAULT 1,
  created_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role  (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 2. PRODUCTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(255)   NOT NULL,
  description    TEXT           DEFAULT NULL,
  category       ENUM('fashion','stationery','backpacks') NOT NULL,
  price          DECIMAL(10,2)  NOT NULL,
  original_price DECIMAL(10,2)  DEFAULT NULL,
  stock          INT UNSIGNED   NOT NULL DEFAULT 0,
  image          VARCHAR(255)   DEFAULT NULL,
  badge          VARCHAR(60)    DEFAULT NULL,
  rating         DECIMAL(3,2)   NOT NULL DEFAULT 5.00,
  review_count   INT UNSIGNED   NOT NULL DEFAULT 0,
  sku            VARCHAR(80)    UNIQUE DEFAULT NULL,
  featured       TINYINT(1)     NOT NULL DEFAULT 0,
  status         ENUM('active','inactive','out_of_stock') NOT NULL DEFAULT 'active',
  created_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_status   (status),
  INDEX idx_featured (featured),
  FULLTEXT idx_search (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 3. ADDRESSES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  label       VARCHAR(60)  NOT NULL DEFAULT 'Home',
  line1       VARCHAR(255) NOT NULL,
  line2       VARCHAR(255) DEFAULT NULL,
  city        VARCHAR(100) NOT NULL,
  state       VARCHAR(100) NOT NULL,
  pincode     VARCHAR(10)  NOT NULL,
  is_default  TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 4. CART
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  product_id  INT UNSIGNED NOT NULL,
  quantity    INT UNSIGNED NOT NULL DEFAULT 1,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_product (user_id, product_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 5. WISHLIST
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  product_id  INT UNSIGNED NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_product (user_id, product_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 6. ORDERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number     VARCHAR(30)    NOT NULL UNIQUE,
  user_id          INT UNSIGNED   NOT NULL,
  address_id       INT UNSIGNED   DEFAULT NULL,
  shipping_address JSON           DEFAULT NULL,
  subtotal         DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  shipping_fee     DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  discount         DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  total_amount     DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  payment_method   ENUM('cod','upi','card','netbanking') NOT NULL DEFAULT 'cod',
  payment_status   ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  status           ENUM('pending','confirmed','shipped','delivered','cancelled','returned')
                   NOT NULL DEFAULT 'pending',
  coupon_code      VARCHAR(40)    DEFAULT NULL,
  notes            TEXT           DEFAULT NULL,
  created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_user        (user_id),
  INDEX idx_status      (status),
  INDEX idx_order_num   (order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 7. ORDER ITEMS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id    INT UNSIGNED   NOT NULL,
  product_id  INT UNSIGNED   NOT NULL,
  name        VARCHAR(255)   NOT NULL,          -- snapshot at purchase time
  image       VARCHAR(255)   DEFAULT NULL,
  price       DECIMAL(10,2)  NOT NULL,          -- price at purchase time
  quantity    INT UNSIGNED   NOT NULL DEFAULT 1,
  subtotal    DECIMAL(10,2)  NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_order   (order_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 8. REVIEWS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id   INT UNSIGNED  NOT NULL,
  user_id      INT UNSIGNED  NOT NULL,
  rating       TINYINT       NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title        VARCHAR(200)  DEFAULT NULL,
  body         TEXT          DEFAULT NULL,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_product (user_id, product_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 9. COUPONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code            VARCHAR(40)    NOT NULL UNIQUE,
  type            ENUM('percent','fixed') NOT NULL DEFAULT 'percent',
  value           DECIMAL(10,2)  NOT NULL,
  min_order       DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  max_discount    DECIMAL(10,2)  DEFAULT NULL,
  usage_limit     INT UNSIGNED   DEFAULT NULL,
  used_count      INT UNSIGNED   NOT NULL DEFAULT 0,
  expires_at      DATETIME       DEFAULT NULL,
  is_active       TINYINT(1)     NOT NULL DEFAULT 1,
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
