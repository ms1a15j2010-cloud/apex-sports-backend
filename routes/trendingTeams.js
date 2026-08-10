const express = require("express");

const router = express.Router();

const {
  getTrendingTeams,
} = require("../controllers/trendingTeamController");

router.get("/", getTrendingTeams);

module.exports = router;