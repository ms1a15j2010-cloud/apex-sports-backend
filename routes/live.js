const express = require("express");

const router = express.Router();

const {
  getLiveMatches,
} = require("../controllers/liveController");

router.get("/", getLiveMatches);

module.exports = router;