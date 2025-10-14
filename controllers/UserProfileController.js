// controllers/UserProfileController.js
const UserProfileModel = require("../models/UserProfileModel");

async function getUserProfile(req, res) {
  try {
    const { id } = req.params;
    const user = await UserProfileModel.getUserProfileById(id);

    if (!user) {
      return res.status(404).json({ message: "UserProfile not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("❌ Error in getUserProfile:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { getUserProfile };
