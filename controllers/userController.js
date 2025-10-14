const User = require("../models/userModel");

// گرفتن اطلاعات کاربر جاری
const getUserDetails = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "کاربر احراز هویت نشده" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "کاربر یافت نشد" });

    res.json({ success: true, data: user });
  } catch (err) {
    console.error("❌ getUserDetails error:", err);
    res.status(500).json({ success: false, message: "خطای سرور" });
  }
};

// بروزرسانی جزئی اطلاعات کاربر جاری
const updateUserDetails = async (req, res) => {
  try {
    const userIdFromToken = req.user.id; // این کاربر جاری است
    const { userId, age, city, gender, profile_image } = req.body;

    const updatedUser = await User.updateProfile(userIdFromToken, { userId, age, city, gender, profile_image });

    res.json({ success: true, message: "اطلاعات کاربر بروزرسانی شد", data: updatedUser });
  } catch (err) {
    console.error("❌ updateUserDetails error:", err);
    res.status(500).json({ success: false, message: "خطای سرور" });
  }
};

module.exports = {
  getUserDetails,
  updateUserDetails,
};
