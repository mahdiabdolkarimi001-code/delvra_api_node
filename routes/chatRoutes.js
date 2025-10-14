const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 📁 مسیر ذخیره‌سازی فایل‌ها
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// 🔹 دریافت لیست چت‌ها برای کاربر
router.get("/chat-list/:userId", chatController.getChatList);

// 🔹 دریافت مکالمه بین دو کاربر
router.get("/conversation/:userId/:friendId", chatController.getConversation);

// 🔹 ارسال پیام متنی یا فایل (ویس، عکس، ویدیو)
router.post("/send-message", upload.single("file"), chatController.sendMessage);

// 🔹 علامت‌گذاری پیام به عنوان خوانده شده
router.patch("/messages/:id/read", chatController.markAsRead);

// 🔹 حذف کامل مکالمه و پیام‌های بین دو کاربر
router.delete("/conversation/:userId/:friendId", chatController.deleteConversation);

// 🔹 بررسی وضعیت آنلاین کاربر
router.get("/user/:userId/online", (req, res) => {
  const { userId } = req.params;
  const onlineUsers = req.app.locals.onlineUsers || new Map();
  const isOnline = onlineUsers.has(userId);
  res.json({ userId, online: isOnline });
});

module.exports = router;
