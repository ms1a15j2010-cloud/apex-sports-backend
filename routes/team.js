const express = require("express");

const router = express.Router();

/* =====================================================
   CONTROLLERS
===================================================== */

const {
  getTeam,
  getPlayers,
  getStatistics,
  getFixtures,
  getHistory,
  getCoach,
  getTransfers,
  getInjuries,
  getTrophies,
} = require("../controllers/teamController");

/* =====================================================
   TEAM PROFILE
===================================================== */

router.get("/:id", getTeam);

/* =====================================================
   TEAM PLAYERS
===================================================== */

router.get("/:id/players", getPlayers);

/* =====================================================
   TEAM STATISTICS
===================================================== */

router.get("/:id/statistics", getStatistics);

/* =====================================================
   TEAM FIXTURES
===================================================== */

router.get("/:id/fixtures", getFixtures);

/* =====================================================
   TEAM HISTORY
===================================================== */

router.get("/:id/history", getHistory);

/* =====================================================
   TEAM COACH
===================================================== */

router.get("/:id/coach", getCoach);

/* =====================================================
   TEAM TRANSFERS
===================================================== */

router.get("/:id/transfers", getTransfers);

/* =====================================================
   TEAM INJURIES
===================================================== */

router.get("/:id/injuries", getInjuries);

/* =====================================================
   TEAM TROPHIES
===================================================== */

router.get("/:id/trophies", getTrophies);

module.exports = router;