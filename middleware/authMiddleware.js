const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET || "my_secret_key";

/**
 * Middleware برای احراز هویت JWT
 * توکن JWT باید در هدر Authorization با فرمت "Bearer <token>" ارسال شود
 * پس از تایید توکن، اطلاعات کاربر در req.user قرار می‌گیرد
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "توکن ارسال نشده است" });
    }

    // استخراج توکن از فرمت "Bearer <token>"
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "توکن نامعتبر است" });
    }

    // اعتبارسنجی JWT
    const decoded = jwt.verify(token, SECRET_KEY);

    if (!decoded || !decoded.user || !decoded.user.id) {
      return res.status(403).json({ message: "توکن نامعتبر یا منقضی شده است" });
    }

    // قرار دادن کاربر در req.user برای دسترسی در کنترلرها
    req.user = decoded.user;

    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return res.status(403).json({ message: "توکن نامعتبر است" });
  }
};

module.exports = authMiddleware;
