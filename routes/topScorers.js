const express = require("express");

const {
  getTopScorers,
} = require("../controllers/topScorersController");

const router =
  express.Router();

/* =====================================================
TOP SCORERS ROUTES

OLD:
API-Football /players/topscorers

NEW:
football-data.org /competitions/{code}/scorers
===================================================== */

/* =====================================================
GET TOP SCORERS

Examples:

/api/top-scorers/epl

/api/top-scorers/epl?season=2025

/api/top-scorers/epl?season=2025&limit=10

/api/top-scorers/39
===================================================== */

router.get(
  "/:league",
  getTopScorers
);

module.exports = router;