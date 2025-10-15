const path = require("path");
const fs = require("fs");

// مسیر Volume writeable Liara
const uploadDir = "/uploads/messages";

// اطمینان از وجود پوشه
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const uploadMedia = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "فایل آپلود نشد" });
  }

  const filePath = path.join("/uploads/messages", req.file.filename); // مسیر قابل دسترسی از مرورگر یا اپ
  return res.json({ success: true, url: filePath });
};

module.exports = { uploadMedia };
