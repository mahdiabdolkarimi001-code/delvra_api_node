function errorHandler(err, req, res, next) {
  console.error("❌ Error:", err);
  res.status(500).json({ success: false, message: "خطای سرور" });
}

module.exports = errorHandler;
