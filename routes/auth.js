const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  verifyEmail, // ✅ اضافه شد
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// -------------------------
// ثبت‌نام (ارسال کد به ایمیل)
// -------------------------
router.post("/register", registerUser);

// -------------------------
// تأیید ایمیل با کد (جدید)
// -------------------------
router.post("/verify", verifyEmail);

// -------------------------
// ورود
// -------------------------
router.post("/login", loginUser);

// -------------------------
// پروفایل (JWT لازم) — ⚠️ هیچ تغییری نکرد
// -------------------------
router.get("/profile", authMiddleware, getProfile);

module.exports = router;
