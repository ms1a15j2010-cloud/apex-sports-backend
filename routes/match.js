const express = require("express");

const router = express.Router();


/* =====================================================
   MAIN MATCH
===================================================== */

const {
  getMatch,
} = require("../controllers/matchController");

/* =====================================================
   EXISTING CONTROLLERS
===================================================== */

const {
  getEvents,
} = require("../controllers/eventsController");

const {
  getStatistics,
} = require("../controllers/statisticsController");

const {
  getLineups,
} = require("../controllers/lineupsController");

const {
  getPlayerStatistics,
} = require("../controllers/playersStatisticsController");

/* =====================================================
   NEW CONTROLLERS
===================================================== */

const {
  getTimeline,
} = require("../controllers/timelineController");

const {
  getFacts,
} = require("../controllers/factsController");

const {
  getHeadToHead,
} = require("../controllers/headToHeadController");

const {
  getStandings,
} = require("../controllers/matchStandingsController");

const {
  getPrediction,
} = require("../controllers/predictionController");

/* =====================================================
   MATCH DETAILS
===================================================== */

router.get("/:id", getMatch);

/* =====================================================
   EVENTS
===================================================== */

router.get("/:id/events", getEvents);

/* =====================================================
   TIMELINE
===================================================== */

router.get("/:id/timeline", getTimeline);

/* =====================================================
   STATISTICS
===================================================== */

router.get("/:id/statistics", getStatistics);

/* =====================================================
   LINEUPS
===================================================== */

router.get("/:id/lineups", getLineups);

/* =====================================================
   PLAYER RATINGS
===================================================== */

router.get("/:id/players", getPlayerStatistics);

/* =====================================================
   FACTS
===================================================== */

router.get("/:id/facts", getFacts);

/* =====================================================
   HEAD TO HEAD
===================================================== */

router.get("/:id/headtohead", getHeadToHead);

/* =====================================================
   STANDINGS
===================================================== */

router.get("/:id/standings", getStandings);

/* =====================================================
   PREDICTION
===================================================== */

router.get("/:id/prediction", getPrediction);


module.exports = router;