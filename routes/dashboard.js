const express = require("express");

const router = express.Router();

/* =====================================================
   CONTROLLERS
===================================================== */

const {
  getDashboardHero,
} = require("../controllers/dashboardController");

const {
  getFeaturedMatch,
} = require("../controllers/featuredMatchController");

const {
  getLiveMatches,
} = require("../controllers/liveController");

const {
  getTodayMatches,
} = require("../controllers/todayController");

const {
  getTopLeagues,
} = require("../controllers/topLeagueController");

const {
  getTrendingTeams,
} = require("../controllers/trendingTeamController");

const {
  getLatestResults,
} = require("../controllers/latestResultsController");

const {
  getTopScorersMini,
} = require("../controllers/topScorersMiniController");

const {
  getStandingsMini,
} = require("../controllers/standingsMiniController");

/* =====================================================
   DASHBOARD
===================================================== */

router.get("/", getDashboardHero);

/* =====================================================
   FEATURED
===================================================== */

router.get("/featured", getFeaturedMatch);

/* =====================================================
   LIVE
===================================================== */

router.get("/live", getLiveMatches);

/* =====================================================
   TODAY
===================================================== */

router.get("/today", getTodayMatches);

/* =====================================================
   LEAGUES
===================================================== */

router.get("/leagues", getTopLeagues);

/* =====================================================
   TEAMS
===================================================== */

router.get("/teams", getTrendingTeams);

/* =====================================================
   RESULTS
===================================================== */

router.get("/results", getLatestResults);

/* =====================================================
   TOP SCORERS
===================================================== */

router.get("/topscorers", getTopScorersMini);

/* =====================================================
   STANDINGS
===================================================== */

router.get("/standings", getStandingsMini);

module.exports = router;