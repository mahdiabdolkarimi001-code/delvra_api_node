const EditProfile = require('../models/EditProfile');
const path = require('path');

const editProfileController = {
  getProfile: async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await EditProfile.getByUserId(userId);
      if (!user) return res.status(404).json({ message: 'کاربر پیدا نشد' });
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  updateProfile: async (req, res) => {
    const { userId } = req.params;

    try {
      // گرفتن پروفایل فعلی برای حفظ تصاویر و فیلدهایی که ارسال نشده‌اند
      const currentUser = await EditProfile.getByUserId(userId);
      if (!currentUser) return res.status(404).json({ message: 'کاربر پیدا نشد' });

      const data = { ...req.body };

      // مسیر فایل‌ها را اضافه کن اگر آپلود شده باشند، در غیر این صورت مقدار قبلی را نگه دار
      for (let i = 1; i <= 5; i++) {
        const fileField = `profile_image${i}`;
        if (req.files && req.files[fileField]) {
          data[fileField] = `/uploads/${req.files[fileField][0].filename}`;
        } else {
          data[fileField] = currentUser[fileField] || null; 
        }
      }

      // سایر فیلدها هم اگر ارسال نشده باشند، مقدار قبلی را نگه داریم
      const fields = ['name', 'age', 'city', 'gender', 'occupation', 'education', 'height', 'weight', 'bio'];
      fields.forEach(field => {
        if (data[field] === undefined) {
          data[field] = currentUser[field];
        }
      });

      await EditProfile.updateProfile(userId, data);
      const updatedUser = await EditProfile.getByUserId(userId);
      res.json({ message: 'پروفایل با موفقیت بروزرسانی شد', user: updatedUser });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = editProfileController;
