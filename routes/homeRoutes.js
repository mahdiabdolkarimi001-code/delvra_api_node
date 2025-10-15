const express = require("express");
const router = express.Router();
const { showHomePage } = require("../controllers/homeController");

// مسیر خانه
router.get("/", showHomePage);

module.exports = router;
