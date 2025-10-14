const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ایجاد پوشه uploads اگر وجود نداشته باشد
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// تنظیمات ذخیره سازی
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname).toLowerCase());
  },
});

// فیلتر فایل (بدون محدودیت)
const fileFilter = (req, file, cb) => {
  cb(null, true); // همه فایل‌ها پذیرفته می‌شوند
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
