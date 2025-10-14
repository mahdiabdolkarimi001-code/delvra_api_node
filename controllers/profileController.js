const User = require("../models/User");

// گرفتن پروفایل
const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "کاربر احراز هویت نشده" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "کاربر یافت نشد" });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile_images: [
          user.profile_image1,
          user.profile_image2,
          user.profile_image3,
          user.profile_image4,
          user.profile_image5,
        ].filter(Boolean),
      },
    });
  } catch (err) {
    console.error("❌ GetProfile error:", err);
    res.status(500).json({ success: false, message: "خطای سرور" });
  }
};

// آپدیت پروفایل (نام اجباری + عکس اختیاری)
const updateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "کاربر احراز هویت نشده" });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "نام الزامی است" });
    }

    // مسیر عکس فقط اگر فایل آپلود شده باشد
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    // آپدیت فقط فیلدهایی که مقدار دارند
    const updatedUser = await User.updateProfile(req.user.id, name, imagePath);

    res.json({
      success: true,
      message: "پروفایل بروزرسانی شد",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        profile_images: [
          updatedUser.profile_image1,
          updatedUser.profile_image2,
          updatedUser.profile_image3,
          updatedUser.profile_image4,
          updatedUser.profile_image5,
        ].filter(Boolean),
      },
    });
  } catch (err) {
    console.error("❌ UpdateProfile error:", err);
    res.status(500).json({ success: false, message: "خطای سرور" });
  }
};

module.exports = { getProfile, updateProfile };
