const EditProfile = require('../models/EditProfile');
const fs = require('fs');
const path = require('path');

// مسیر Volume Liara
const uploadDir = '/uploads';

// بررسی مسیر بدون mkdir
try {
  if (!fs.existsSync(uploadDir)) {
    console.warn("⚠️ مسیر /uploads هنوز در دسترس نیست (Liara ممکن است هنوز mount نکرده باشد)");
  } else {
    console.log("✅ مسیر /uploads آماده است.");
  }
} catch (err) {
  console.error("❌ خطا هنگام بررسی مسیر /uploads:", err.message);
}

const editProfileController = {
  // گرفتن پروفایل
  getProfile: async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await EditProfile.getByUserId(userId);
      if (!user) return res.status(404).json({ message: 'کاربر پیدا نشد' });
      res.json(user);
    } catch (err) {
      console.error("❌ getProfile error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // آپدیت پروفایل
  updateProfile: async (req, res) => {
    const { userId } = req.params;

    try {
      const currentUser = await EditProfile.getByUserId(userId);
      if (!currentUser) return res.status(404).json({ message: 'کاربر پیدا نشد' });

      const data = { ...req.body };

      // مدیریت فایل‌های پروفایل
      for (let i = 1; i <= 5; i++) {
        const fileField = `profile_image${i}`;
        if (req.files && req.files[fileField] && req.files[fileField][0]) {
          // مسیر ذخیره فایل روی Liara
          data[fileField] = `/uploads/${req.files[fileField][0].filename}`;
        } else {
          data[fileField] = currentUser[fileField] || null;
        }
      }

      // مدیریت سایر فیلدهای کاربر
      const fields = ['name', 'age', 'city', 'gender', 'occupation', 'education', 'height', 'weight', 'bio'];
      fields.forEach(field => {
        if (data[field] === undefined) {
          data[field] = currentUser[field];
        }
      });

      // بروزرسانی در دیتابیس
      await EditProfile.updateProfile(userId, data);
      const updatedUser = await EditProfile.getByUserId(userId);

      res.json({ message: 'پروفایل با موفقیت بروزرسانی شد', user: updatedUser });

    } catch (err) {
      console.error("❌ updateProfile error:", err);
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = editProfileController;
