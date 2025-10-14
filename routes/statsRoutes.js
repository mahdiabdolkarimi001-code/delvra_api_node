// routes/userStatsRoutes.js
const express = require("express");
const router = express.Router();
const userStatsController = require("../controllers/statsController");

// 📊 گرفتن آمار یک کاربر
router.get("/stats/:userId", userStatsController.getUserStats);

// ⬆️ بروزرسانی یا درج آمار کاربر (Upsert)
router.put("/stats/:userId", userStatsController.upsertUserStats);

module.exports = router;
