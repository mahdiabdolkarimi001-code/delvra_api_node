const SearchUser = require("../models/searchUserModel");

// گرفتن همه کاربران
const getAllUsers = async (req, res) => {
  try {
    const users = await SearchUser.getAll();
    res.json({
      success: true,
      users,
    });
  } catch (err) {
    console.error("❌ getAllUsers error:", err);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت کاربران",
      error: err.message,
    });
  }
};

// ارسال درخواست دوستی بدون JWT
const sendFriendRequest = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res
        .status(400)
        .json({ success: false, message: "شناسه فرستنده یا گیرنده دریافت نشده است" });
    }

    if (senderId === receiverId) {
      return res
        .status(400)
        .json({ success: false, message: "نمی‌توانید به خودتان درخواست بدهید" });
    }

    const exists = await SearchUser.requestExists(senderId, receiverId);
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "درخواست قبلاً ارسال شده است" });
    }

    const requestId = await SearchUser.sendRequest(senderId, receiverId);

    res.status(201).json({
      success: true,
      message: "درخواست دوستی ارسال شد",
      requestId,
    });
  } catch (err) {
    console.error("❌ sendFriendRequest error:", err);
    res.status(500).json({
      success: false,
      message: "خطا در ارسال درخواست دوستی",
      error: err.message,
    });
  }
};

module.exports = { getAllUsers, sendFriendRequest };
