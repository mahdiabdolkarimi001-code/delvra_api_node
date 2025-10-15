const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { uploadMedia } = require("../controllers/uploadController");

// مسیر Volume Liara
const uploadDir = "/uploads/messages";

// بررسی اولیه مسیر
if (!fs.existsSync(uploadDir)) {
  console.warn("⚠️ مسیر /uploads/messages هنوز در دسترس نیست. مطمئن شوید Volume mount شده است!");
}

// تنظیمات multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // فقط مسیر Volume قابل نوشتن
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  },
});

// فیلتر نوع فایل
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|mp4|mov|mkv|webm|aac|mp3|wav|m4a/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error("فرمت فایل پشتیبانی نمی‌شود"), false);
};

// حداکثر حجم 50MB
const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

// مسیر آپلود
router.post("/media", upload.single("file"), uploadMedia);

module.exports = router;
