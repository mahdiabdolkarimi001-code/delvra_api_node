const express = require("express");
const router = express.Router();
const { checkAdminAuth } = require("../middleware/adminMiddleware");
const { showAdminUsersPage, getUsers, removeUser } = require("../controllers/adminUserController");

// صفحه HTML
router.get("/admin/usersPage", checkAdminAuth, showAdminUsersPage);

// داده‌ها و عملیات حذف
router.get("/admin/users/data", checkAdminAuth, getUsers);
router.delete("/admin/users/data/:id", checkAdminAuth, removeUser);

module.exports = router;
