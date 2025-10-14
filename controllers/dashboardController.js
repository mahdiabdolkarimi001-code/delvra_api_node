const Dashboard = require("../models/dashboardModel");

// -------------------------
// کنترلر دریافت اطلاعات پایه کاربر (userId, name, age, city, profile_image)
// -------------------------
exports.getDashboardData = async (req, res, next) => {
  try {
    // کاربر از middleware شناسایی شده است
    const userIdFromToken = req.user?.id;
    const emailFromToken = req.user?.email;

    if (!userIdFromToken && !emailFromToken) {
      return res.status(401).json({ success: false, message: "کاربر احراز هویت نشده" });
    }

    const userData = await Dashboard.getUserProfile(userIdFromToken, emailFromToken);

    if (!userData) {
      console.log(`❌ کاربر یافت نشد: ${userIdFromToken || emailFromToken}`);
      return res.status(404).json({ success: false, message: "کاربر یافت نشد" });
    }

    console.log("🔹 Dashboard data fetched:", userData);

    res.json({
      success: true,
      data: {
        userId: userData.userId,           // فقط برای نمایش
        name: userData.name || "",
        age: userData.age || null,
        city: userData.city || "",
        profile_image: userData.profile_image || null,
      },
    });
  } catch (err) {
    console.error("❌ getDashboardData error:", err);
    next(err);
  }
};
