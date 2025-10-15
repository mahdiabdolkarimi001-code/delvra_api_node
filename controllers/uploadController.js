const path = require("path");
const fs = require("fs");

// مسیر Volume Liara (قابل نوشتن)
const uploadDir = "/uploads/messages";

// بررسی در دسترس بودن مسیر، بدون mkdir
try {
  if (!fs.existsSync(uploadDir)) {
    console.warn("⚠️ مسیر /uploads/messages هنوز در دسترس نیست (ممکن است Liara هنوز دیسک را mount نکرده باشد)");
  } else {
    console.log("✅ مسیر /uploads/messages در دسترس است.");
  }
} catch (err) {
  console.error("❌ خطا در بررسی مسیر:", err);
}

const uploadMedia = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "فایل آپلود نشد" });
  }

  // مسیر فایل برای نمایش در فرانت‌اند
  const filePath = `/uploads/messages/${req.file.filename}`;
  return res.json({ success: true, url: filePath });
};

module.exports = { uploadMedia };
