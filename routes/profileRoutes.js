const express = require("express");
const { getProfile, updateProfile } = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// دریافت پروفایل
router.get("/", authMiddleware, getProfile);

// بروزرسانی پروفایل (نام + تصویر اختیاری)
router.put("/", authMiddleware, upload.single("profile_image"), updateProfile);

module.exports = router;
