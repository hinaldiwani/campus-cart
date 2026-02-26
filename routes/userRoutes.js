/**
 * routes/userRoutes.js
 * All routes require authentication.
 *
 * GET    /api/v1/users/profile
 * PUT    /api/v1/users/profile
 * PATCH  /api/v1/users/password
 *
 * GET    /api/v1/users/addresses
 * POST   /api/v1/users/addresses
 * PUT    /api/v1/users/addresses/:id
 * DELETE /api/v1/users/addresses/:id
 *
 * POST   /api/v1/users/reviews/:productId
 * DELETE /api/v1/users/reviews/:id
 */

const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const { protect } = require("../middleware/auth");
const {
  getProfile,
  updateProfile,
  updatePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  addReview,
  deleteReview,
} = require("../controllers/userController");

// Avatar upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "../public/images/avatars")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
  },
});
const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_req, file, cb) => {
    /\.(jpe?g|png|webp)$/i.test(file.originalname)
      ? cb(null, true)
      : cb(new Error("Images only."));
  },
}).single("avatar");

router.use(protect);

// Profile
router.get("/profile", getProfile);
router.put(
  "/profile",
  (req, res, next) =>
    uploadAvatar(req, res, (err) => {
      if (err)
        return res.status(400).json({ status: "fail", message: err.message });
      next();
    }),
  updateProfile,
);

router.patch("/password", updatePassword);

// Addresses
router.get("/addresses", getAddresses);
router.post("/addresses", addAddress);
router.put("/addresses/:id", updateAddress);
router.delete("/addresses/:id", deleteAddress);

// Reviews
router.post("/reviews/:productId", addReview);
router.delete("/reviews/:id", deleteReview);

module.exports = router;
