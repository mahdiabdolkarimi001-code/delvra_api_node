const EditProfile = require('../models/EditProfile');
const fs = require('fs');
const path = require('path');

// مسیر Volume Liara
const uploadDir = '/uploads';

// اطمینان از وجود پوشه uploads
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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
      const currentUser = await EditProfile.getByUserId(userId);
      if (!currentUser) return res.status(404).json({ message: 'کاربر پیدا نشد' });

      const data = { ...req.body };

      // مدیریت فایل‌ها
      for (let i = 1; i <= 5; i++) {
        const fileField = `profile_image${i}`;
        if (req.files && req.files[fileField]) {
          data[fileField] = `/uploads/${req.files[fileField][0].filename}`;
        } else {
          data[fileField] = currentUser[fileField] || null;
        }
      }

      // مدیریت سایر فیلدها
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
