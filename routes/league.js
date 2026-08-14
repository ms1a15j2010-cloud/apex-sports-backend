// routes/league.js

const express = require("express");

const router =
  express.Router();

const {
  getLeague,
  getFixtures,
  getResults,
  getStandings,
  getTopScorers,
  getTopAssists,
  getTeams,
  getStatistics,
} = require(
  "../controllers/leagueController"
);

/* =====================================================
LEAGUE OVERVIEW

/api/league/epl
===================================================== */

router.get(
  "/:id",
  getLeague
);

/* =====================================================
FIXTURES

/api/league/epl/fixtures
===================================================== */

router.get(
  "/:id/fixtures",
  getFixtures
);

/* =====================================================
RESULTS

/api/league/epl/results
===================================================== */

router.get(
  "/:id/results",
  getResults
);

/* =====================================================
STANDINGS

/api/league/epl/standings

OR, if your existing frontend sends:

/api/league/39/standings

your leagueController must translate 39 -> epl -> PL.
===================================================== */

router.get(
  "/:id/standings",
  getStandings
);

/* =====================================================
TOP SCORERS
===================================================== */

router.get(
  "/:id/topscorers",
  getTopScorers
);

/* =====================================================
TOP ASSISTS
===================================================== */

router.get(
  "/:id/topassists",
  getTopAssists
);

/* =====================================================
TEAMS
===================================================== */

router.get(
  "/:id/teams",
  getTeams
);

/* =====================================================
STATISTICS
===================================================== */

router.get(
  "/:id/statistics",
  getStatistics
);

module.exports = router;