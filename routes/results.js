const express = require("express");

const {
  getLatestResults,
} = require(
  "../controllers/latestResultsController"
);

const router =
  express.Router();

/* =====================================================
RESULTS ROUTES

GET:

/api/results

Examples:

/api/results?league=PL
/api/results?league=PL&season=2025
/api/results?league=epl&season=2025&limit=10
===================================================== */

router.get(
  "/",
  getLatestResults
);

module.exports = router;