const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const editProfileController = require('../controllers/editProfileController');

// مسیر Volume Liara
const uploadDir = '/uploads';

// تنظیمات multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // مسیر writeable Liara
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// Routes
router.get('/:userId', editProfileController.getProfile);

router.put(
  '/:userId',
  upload.fields([
    { name: 'profile_image1', maxCount: 1 },
    { name: 'profile_image2', maxCount: 1 },
    { name: 'profile_image3', maxCount: 1 },
    { name: 'profile_image4', maxCount: 1 },
    { name: 'profile_image5', maxCount: 1 },
  ]),
  editProfileController.updateProfile
);

module.exports = router;
