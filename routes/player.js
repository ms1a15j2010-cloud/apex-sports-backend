const express = require("express");

const router = express.Router();

/* =====================================================
   CONTROLLERS
===================================================== */

const {
  getPlayer,
  getStatistics,
  getCareer,
  getPerformance,
  getFixtures,
  getHistory,
  getTransfers,
  getTrophies,
  searchPlayers,
} = require("../controllers/playerController");

/* =====================================================
   PLAYER SEARCH
===================================================== */

router.get("/search/:name", searchPlayers);

/* =====================================================
   PLAYER PROFILE
===================================================== */

router.get("/:id", getPlayer);

/* =====================================================
   PLAYER STATISTICS
===================================================== */

router.get("/:id/statistics", getStatistics);

/* =====================================================
   PLAYER CAREER
===================================================== */

router.get("/:id/career", getCareer);

/* =====================================================
   PLAYER PERFORMANCE
===================================================== */

router.get("/:id/performance", getPerformance);

/* =====================================================
   PLAYER FIXTURES
===================================================== */

router.get("/:id/fixtures", getFixtures);

/* =====================================================
   PLAYER HISTORY
===================================================== */

router.get("/:id/history", getHistory);

/* =====================================================
   PLAYER TRANSFERS
===================================================== */

router.get("/:id/transfers", getTransfers);

/* =====================================================
   PLAYER TROPHIES
===================================================== */

router.get("/:id/trophies", getTrophies);

module.exports = router;