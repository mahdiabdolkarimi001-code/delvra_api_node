const express = require("express");
const router = express.Router();
const searchUserController = require("../controllers/searchUserController");

// گرفتن همه کاربران بدون JWT
router.get("/search-users", searchUserController.getAllUsers);

// گرفتن کاربران آنلاین
router.get("/online", async (req, res) => {
  try {
    const onlineUsersMap = req.app.locals.onlineUsers; // Map userId -> ws
    const onlineUsers = [];

    onlineUsersMap.forEach((ws, userId) => {
      onlineUsers.push({
        id: parseInt(userId),
        connectedAt: ws.connectedAt?.toISOString() || new Date().toISOString(),
      });
    });

    // مرتب‌سازی کاربران آنلاین بر اساس زمان اتصال (قدیمی‌ترین بالا)
    onlineUsers.sort((a, b) => new Date(a.connectedAt) - new Date(b.connectedAt));

    res.json({ success: true, onlineUsers });
  } catch (err) {
    console.error("❌ online users error:", err);
    res.status(500).json({ success: false, message: "خطا در دریافت کاربران آنلاین" });
  }
});

// ارسال درخواست دوستی بدون JWT
router.post("/send-request", searchUserController.sendFriendRequest);

module.exports = router;
