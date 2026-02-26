# CampusCart — Node.js + Express + MySQL Backend

A full professional backend for the CampusCart e-commerce platform.

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your MySQL credentials:

```bash
cp .env.example .env
```

Key variables:
| Variable | Default | Description |
|---|---|---|
| `DB_HOST` | localhost | MySQL host |
| `DB_USER` | root | MySQL username |
| `DB_PASSWORD` | _(yours)_ | MySQL password |
| `DB_NAME` | campuscart | Database name |
| `JWT_SECRET` | change-me | Secret for JWT signing |
| `PORT` | 3000 | Server port |

### 3. Create database & seed data

```bash
npm run db:setup   # creates all tables
npm run db:seed    # inserts admin user, 9 products, 1 coupon
```

### 4. Start the server

```bash
npm run dev        # development (nodemon, auto-restart)
npm start          # production
```

Server runs at **http://localhost:3000**

---

## Project Structure

```
campus-cart/
├── config/
│   └── db.js                  MySQL connection pool
├── controllers/
│   ├── authController.js      Register / Login / Logout
│   ├── productController.js   Public product listings & search
│   ├── cartController.js      Cart CRUD
│   ├── wishlistController.js  Wishlist toggle / move-to-cart
│   ├── orderController.js     Place orders, coupon, history
│   ├── userController.js      Profile, addresses, reviews
│   └── adminController.js     Admin dashboard, full CRUD
├── database/
│   ├── schema.sql             9-table MySQL schema
│   ├── setup.js               Run schema (one-time)
│   └── seed.js                Seed admin + products + coupon
├── middleware/
│   ├── auth.js                JWT protect / optionalAuth
│   ├── adminAuth.js           adminOnly gate
│   └── errorHandler.js        validate / notFound / errorHandler
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Cart.js
│   ├── Wishlist.js
│   ├── Order.js
│   ├── Review.js
│   └── Coupon.js
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── cartRoutes.js
│   ├── wishlistRoutes.js
│   ├── orderRoutes.js
│   ├── userRoutes.js
│   └── adminRoutes.js
├── public/
│   └── images/                uploaded product & avatar images
├── pages/                     existing HTML frontend
├── css/                       existing stylesheets
├── server.js                  Express app entry point
├── package.json
└── .env
```

---

## API Reference

All API routes are prefixed with `/api/v1/`.

### Auth

| Method | Route            | Auth | Description        |
| ------ | ---------------- | ---- | ------------------ |
| POST   | `/auth/register` | —    | Create account     |
| POST   | `/auth/login`    | —    | Login, returns JWT |
| POST   | `/auth/logout`   | —    | Clear JWT cookie   |
| GET    | `/auth/me`       | 🔒   | Get current user   |

### Products (public)

| Method | Route                        | Description                          |
| ------ | ---------------------------- | ------------------------------------ |
| GET    | `/products`                  | All products (paginated, filterable) |
| GET    | `/products/featured`         | Featured products                    |
| GET    | `/products/search?q=`        | Search by name                       |
| GET    | `/products/category/:cat`    | By category                          |
| GET    | `/products/categories/count` | Product counts per category          |
| GET    | `/products/:id`              | Single product                       |
| GET    | `/products/:id/reviews`      | Product reviews                      |

### Cart (🔒 auth required)

| Method | Route              | Description                        |
| ------ | ------------------ | ---------------------------------- |
| GET    | `/cart`            | Get cart with totals               |
| POST   | `/cart`            | Add item (`productId`, `quantity`) |
| PATCH  | `/cart`            | Update quantity                    |
| DELETE | `/cart/:productId` | Remove item                        |
| DELETE | `/cart`            | Clear cart                         |

### Wishlist (🔒)

| Method | Route                    | Description       |
| ------ | ------------------------ | ----------------- |
| GET    | `/wishlist`              | Get wishlist      |
| POST   | `/wishlist/toggle`       | Add / remove item |
| POST   | `/wishlist/move-to-cart` | Move item to cart |

### Orders (🔒)

| Method | Route                | Description               |
| ------ | -------------------- | ------------------------- |
| POST   | `/orders/coupon`     | Validate & preview coupon |
| POST   | `/orders`            | Place order               |
| GET    | `/orders`            | My orders                 |
| GET    | `/orders/:id`        | Order details             |
| PATCH  | `/orders/:id/cancel` | Cancel order              |

### User profile (🔒)

| Method     | Route                       | Description                      |
| ---------- | --------------------------- | -------------------------------- |
| GET        | `/users/profile`            | Get profile                      |
| PUT        | `/users/profile`            | Update profile (+ avatar upload) |
| PATCH      | `/users/password`           | Change password                  |
| GET/POST   | `/users/addresses`          | Manage addresses                 |
| PUT/DELETE | `/users/addresses/:id`      | Update / delete address          |
| POST       | `/users/reviews/:productId` | Add review                       |
| DELETE     | `/users/reviews/:id`        | Delete own review                |

### Admin (🔒 admin only)

| Method                    | Route              | Description                |
| ------------------------- | ------------------ | -------------------------- |
| GET                       | `/admin/dashboard` | Stats + recent orders      |
| GET / PATCH               | `/admin/users`     | List users, toggle active  |
| GET / POST / PUT / DELETE | `/admin/products`  | Product CRUD               |
| GET / PATCH               | `/admin/orders`    | List orders, update status |
| GET / POST / PATCH        | `/admin/coupons`   | Coupon management          |

---

## Default Admin Credentials

```
Email:    admin@campuscart.com
Password: Admin@123
```

_(Change in `.env` before seeding)_

---

## Default Coupon

```
Code:     CAMPUS10
Type:     10% off
Min order: ₹299
Max discount: ₹150
```
