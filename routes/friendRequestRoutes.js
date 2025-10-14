const express = require("express");
const router = express.Router();
const friendRequestController = require("../controllers/friendRequestController");

// 📥 گرفتن درخواست‌های دریافتی
router.get("/received-requests/:userId", friendRequestController.getReceivedRequests);

// ✅ قبول کردن درخواست
router.put("/accept-request/:requestId", friendRequestController.acceptRequest);

// ❌ رد کردن درخواست
router.put("/reject-request/:requestId", friendRequestController.rejectRequest);

// 📋 گرفتن لیست دوستان کاربر
router.get(
  "/friends/:userId",
  friendRequestController.getFriendsList
);

module.exports = router;
