// controllers/friendRequestController.js
const FriendRequest = require("../models/friendRequestModel");

const friendRequestController = {

  // 📥 دریافت همه درخواست‌های دریافتی با اطلاعات کامل فرستنده
  getReceivedRequests: async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ success: false, message: "شناسه کاربر لازم است" });
      }

      const requests = await FriendRequest.getReceivedRequests(userId);
      res.json({ success: true, requests });
    } catch (err) {
      console.error("❌ getReceivedRequests error:", err);
      res.status(500).json({
        success: false,
        message: "خطا در دریافت درخواست‌ها",
        error: err.message,
      });
    }
  },

  // ✅ قبول کردن درخواست و ایجاد دوستی و رکورد چت
  acceptRequest: async (req, res) => {
    try {
      const { requestId } = req.params;

      const success = await FriendRequest.acceptRequest(requestId);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: "درخواست یافت نشد یا قبلاً پردازش شده است",
        });
      }

      res.json({
        success: true,
        message: "✅ درخواست قبول شد و به لیست دوستان اضافه گردید",
      });
    } catch (err) {
      console.error("❌ acceptRequest error:", err);
      res.status(500).json({
        success: false,
        message: "خطا در قبول درخواست",
        error: err.message,
      });
    }
  },

  // ❌ رد کردن درخواست
  rejectRequest: async (req, res) => {
    try {
      const { requestId } = req.params;

      const success = await FriendRequest.rejectRequest(requestId);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: "درخواست یافت نشد یا قبلاً پردازش شده است",
        });
      }

      res.json({ success: true, message: "❌ درخواست رد شد" });
    } catch (err) {
      console.error("❌ rejectRequest error:", err);
      res.status(500).json({
        success: false,
        message: "خطا در رد درخواست",
        error: err.message,
      });
    }
  },

  // 📋 گرفتن لیست دوستان با اطلاعات کامل کاربر
  getFriendsList: async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ success: false, message: "شناسه کاربر لازم است" });
      }

      const friends = await FriendRequest.getFriendsList(userId);
      res.json({ success: true, friends });
    } catch (err) {
      console.error("❌ getFriendsList error:", err);
      res.status(500).json({
        success: false,
        message: "خطا در دریافت لیست دوستان",
        error: err.message,
      });
    }
  },

};

module.exports = friendRequestController;
