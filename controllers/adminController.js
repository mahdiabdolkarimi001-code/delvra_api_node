const path = require("path");
const { findAdmin } = require("../models/adminModel");

function showLogin(req, res) {
  res.sendFile(path.join(__dirname, "../views/login.html"));
}

function login(req, res) {
  const { email, password } = req.body;
  const admin = findAdmin(email, password);

  if (admin) {
    req.session.admin = admin;
    res.redirect("/dashboard");
  } else {
    res.send("<h3>❌ ایمیل یا پسورد اشتباه است <a href='/login'>برگشت</a></h3>");
  }
}

function showDashboard(req, res) {
  res.sendFile(path.join(__dirname, "../views/dashboard.html"));
}

function logout(req, res) {
  req.session.destroy();
  res.redirect("/login");
}

module.exports = { showLogin, login, showDashboard, logout };
