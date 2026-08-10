const express = require("express");

const router = express.Router();

const {
  getLatestResults,
} = require("../controllers/latestResultsController");

router.get("/", getLatestResults);

module.exports = router;