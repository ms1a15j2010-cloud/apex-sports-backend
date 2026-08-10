const express = require("express");

const router = express.Router();

const {
  getTopLeagues,
} = require("../controllers/topLeagueController");

router.get("/", getTopLeagues);

module.exports = router;