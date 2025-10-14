const express = require("express");
const { getDashboardData } = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// دریافت اطلاعات کاربر جاری
router.get("/me", authMiddleware, getDashboardData);

module.exports = router;
