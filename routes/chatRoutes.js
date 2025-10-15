const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// مسیر writeable Liara برای فایل‌های media
const mediaUploadDir = "/uploads/messages";

// بررسی مسیر
if (!fs.existsSync(mediaUploadDir)) {
  console.warn("⚠️ مسیر /uploads/messages هنوز در دسترس نیست. مطمئن شوید Volume mount شده است!");
}

// تنظیمات multer برای فایل‌های media
const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, mediaUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  },
});

const mediaUpload = multer({
  storage: mediaStorage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|mp4|mov|mkv|webm|aac|mp3|wav|m4a/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error("فرمت فایل پشتیبانی نمی‌شود"), false);
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// 🔹 پیام متنی بدون فایل
router.post("/send-message", chatController.sendMessage);

// 🔹 آپلود ویس یا عکس
router.post("/send-message-file", mediaUpload.single("file"), chatController.sendMessage);

// بقیه روت‌ها
router.get("/chat-list/:userId", chatController.getChatList);
router.get("/conversation/:userId/:friendId", chatController.getConversation);
router.patch("/messages/:id/read", chatController.markAsRead);
router.delete("/conversation/:userId/:friendId", chatController.deleteConversation);
router.get("/user/:userId/online", (req, res) => {
  const onlineUsers = req.app.locals.onlineUsers || new Map();
  const isOnline = onlineUsers.has(req.params.userId);
  res.json({ userId: req.params.userId, online: isOnline });
});

module.exports = router;
