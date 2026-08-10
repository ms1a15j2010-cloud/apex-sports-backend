const express = require("express");

const router = express.Router();

const {
  getTodayMatches,
} = require("../controllers/todayController");

router.get("/", getTodayMatches);

module.exports = router;