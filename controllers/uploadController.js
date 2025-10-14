// controllers/uploadController.js
const path = require("path");

const uploadMedia = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "فایل آپلود نشد" });
  }

  const filePath = path.join("/uploads/messages", req.file.filename); // مسیر قابل دسترسی از مرورگر
  return res.json({ success: true, url: filePath });
};

module.exports = { uploadMedia };
