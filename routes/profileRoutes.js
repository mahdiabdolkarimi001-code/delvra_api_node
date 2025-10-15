const express = require("express");
const { getProfile, updateProfile } = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// مسیر Volume Liara
const uploadDir = "/uploads";

// تنظیم multer برای یک فایل
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// دریافت پروفایل
router.get("/", authMiddleware, getProfile);

// بروزرسانی پروفایل (نام + تصویر اختیاری)
router.put("/", authMiddleware, upload.single("profile_image"), updateProfile);

module.exports = router;
