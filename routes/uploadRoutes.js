const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { uploadMedia } = require("../controllers/uploadController");

// مسیر Volume writeable Liara
const uploadDir = "/uploads/messages";

// تنظیمات multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  },
});

// فیلتر فایل
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|mp4|mov|mkv|webm|aac|mp3|wav|m4a/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("فرمت فایل پشتیبانی نمی‌شود"), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } }); // حداکثر 50MB

// POST /api/upload/media
router.post("/media", upload.single("file"), uploadMedia);

module.exports = router;
