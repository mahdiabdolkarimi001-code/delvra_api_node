// controllers/userStatsController.js
const UserStats = require("../models/statsModel");

// 📊 گرفتن آمار یک کاربر
const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "شناسه کاربر لازم است" });
    }

    const stats = await UserStats.getStats(userId);

    if (!stats) {
      return res
        .status(404)
        .json({ success: false, message: "آمار برای این کاربر یافت نشد" });
    }

    res.json({ success: true, stats });
  } catch (err) {
    console.error("❌ getUserStats error:", err);
    res.status(500).json({
      success: false,
      message: "خطا در گرفتن آمار کاربر",
      error: err.message,
    });
  }
};

// ⬆️ درج یا بروزرسانی آمار کاربر (Upsert)
const upsertUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { friends, likes, messages } = req.body;

    if (
      friends === undefined ||
      likes === undefined ||
      messages === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "friends, likes و messages لازم است",
      });
    }

    await UserStats.upsertStats(userId, friends, likes, messages);

    res.json({ success: true, message: "آمار کاربر با موفقیت بروزرسانی شد" });
  } catch (err) {
    console.error("❌ upsertUserStats error:", err);
    res.status(500).json({
      success: false,
      message: "خطا در بروزرسانی آمار کاربر",
      error: err.message,
    });
  }
};

module.exports = { getUserStats, upsertUserStats };
