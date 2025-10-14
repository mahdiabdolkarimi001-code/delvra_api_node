// routes/userProfileRoutes.js
const express = require("express");
const { getUserProfile } = require("../controllers/UserProfileController");

const router = express.Router();

router.get("/:id", getUserProfile);

module.exports = router;
