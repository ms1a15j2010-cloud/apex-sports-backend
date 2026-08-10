const express = require("express");

const router = express.Router();

const {
  getPlayerStatistics,
} = require("../controllers/playerStatisticsController");

router.get("/:id", getPlayerStatistics);

module.exports = router;