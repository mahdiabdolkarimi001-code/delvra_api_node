const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Verification = require("../models/VerificationCode");
const sendEmail = require("../utils/sendEmail");
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET || "my_secret_key";

// -------------------------
// ثبت‌نام (ارسال کد به ایمیل)
// -------------------------
exports.registerUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "ایمیل و رمز عبور الزامی هستند" });

  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser)
      return res.status(400).json({ message: "کاربر از قبل وجود دارد" });

    // ایجاد کاربر جدید (با is_verified = false)
    const newUser = await User.createUser({ email, password });

    // تولید کد ۴ رقمی
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // حذف کدهای قدیمی و ذخیره جدید
    await Verification.deleteCodes(email);
    await Verification.createCode(email, code);

    // ارسال ایمیل کد
    await sendEmail(email, "کد تأیید حساب کاربری", `کد تأیید شما: ${code}`);

    res.status(201).json({
      success: true,
      message: "کد تأیید به ایمیل ارسال شد",
      user: { email: newUser.email },
    });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ message: "خطای سرور" });
  }
};

// -------------------------
// تأیید ایمیل با وارد کردن کد
// -------------------------
exports.verifyEmail = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code)
    return res.status(400).json({ message: "ایمیل و کد الزامی هستند" });

  try {
    const validCode = await Verification.findValidCode(email, code);
    if (!validCode)
      return res.status(400).json({ message: "کد نامعتبر یا منقضی است" });

    // تأیید کاربر
    await User.verifyUser(email);
    await Verification.deleteCodes(email);

    const user = await User.findByEmail(email);

    const token = jwt.sign({ user: { id: user.id } }, SECRET_KEY, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      message: "ایمیل تأیید شد",
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Verify error:", err.message);
    res.status(500).json({ message: "خطای سرور" });
  }
};

// -------------------------
// ورود (فقط برای کاربران تأییدشده)
// -------------------------
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "ایمیل و رمز عبور الزامی هستند" });

  try {
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ message: "کاربر یافت نشد" });

    if (!user.is_verified)
      return res
        .status(403)
        .json({ message: "ابتدا باید ایمیل خود را تأیید کنید" });

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "رمز اشتباه است" });

    const token = jwt.sign({ user: { id: user.id } }, SECRET_KEY, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "خطای سرور" });
  }
};

// -------------------------
// دریافت پروفایل (JWT لازم است)
// -------------------------
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "کاربر یافت نشد" });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_verified: user.is_verified,
      },
    });
  } catch (err) {
    console.error("Get profile error:", err.message);
    res.status(500).json({ message: "خطای سرور" });
  }
};
