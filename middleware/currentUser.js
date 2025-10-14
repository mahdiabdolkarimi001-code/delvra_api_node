module.exports = (req, res, next) => {
  const userId = parseInt(req.headers["x-user-id"] || req.query.userId, 10);

  if (!userId || isNaN(userId)) {
    console.error("❌ کاربر جاری مشخص نشده یا معتبر نیست");
    return res.status(401).json({ error: "کاربر جاری معتبر نیست" });
  }

  req.currentUserId = userId;
  next();
};
