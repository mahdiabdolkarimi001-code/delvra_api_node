const express = require("express");
const router = express.Router();
const {
  showLogin,
  login,
  showDashboard,
  logout,
} = require("../controllers/adminController");
const { checkAdminAuth } = require("../middleware/adminMiddleware");

// صفحات
router.get("/login", showLogin);
router.post("/login", login);
router.get("/dashboard", checkAdminAuth, showDashboard);
router.get("/logout", logout);

module.exports = router;
