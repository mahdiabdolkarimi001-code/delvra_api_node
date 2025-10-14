// routes/userRoutes.js
const express = require("express");
const { getUserDetails, updateUserDetails } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Middleware لاگ
router.use((req, res, next) => {
  console.log(`\n🟢 [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log("📥 Body:", req.body);
  console.log("📥 Query:", req.query);
  next();
});

// گرفتن اطلاعات خود کاربر
router.get("/me", authMiddleware, getUserDetails);

// بروزرسانی جزئی اطلاعات خود کاربر
router.put("/me", authMiddleware, updateUserDetails);

module.exports = router;
