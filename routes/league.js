const express = require("express");
const NodeCache = require("node-cache");

const {
  getLeague,
  getFixtures,
  getStandings,
  getTopScorers,
  getTopAssists,
  getResults,
  getTeams,
  getStatistics,
} = require("../controllers/leagueController");

const router = express.Router();

/* =====================================================
   CACHE
===================================================== */

const cache = new NodeCache({
  stdTTL: 300,
  checkperiod: 60,
});

/* =====================================================
   CACHE MIDDLEWARE
===================================================== */

function cacheMiddleware(ttl = 300) {
  return (req, res, next) => {
    const key = req.originalUrl;

    const cached = cache.get(key);

    if (cached) {
      console.log(`⚡ Cache hit: ${key}`);
      return res.json(cached);
    }

    const originalJson = res.json.bind(res);

    res.json = function (body) {
      if (!res.headersSent) {
        cache.set(key, body, ttl);
      }

      return originalJson(body);
    };

    next();
  };
}

/* =====================================================
   TIMEOUT MIDDLEWARE
===================================================== */

function timeoutMiddleware(timeout = 30000) {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        console.error(`⏰ Route timeout: ${req.method} ${req.originalUrl}`);

        res.status(504).json({
          success: false,
          message: "Request Timeout",
        });
      }
    }, timeout);

    res.on("finish", () => {
      clearTimeout(timer);
    });

    res.on("close", () => {
      clearTimeout(timer);
    });

    next();
  };
}

/* =====================================================
   LEAGUE DETAILS

   GET /api/league/:id

   Examples:
   /api/league/epl
   /api/league/laliga
   /api/league/39
===================================================== */

router.get(
  "/:id",
  timeoutMiddleware(30000),
  cacheMiddleware(600),
  getLeague
);

/* =====================================================
   FIXTURES

   GET /api/league/:id/fixtures

   Example:
   /api/league/epl/fixtures
===================================================== */

router.get(
  "/:id/fixtures",
  timeoutMiddleware(30000),
  cacheMiddleware(120),
  getFixtures
);

/* =====================================================
   RESULTS

   GET /api/league/:id/results

   Example:
   /api/league/epl/results
===================================================== */

router.get(
  "/:id/results",
  timeoutMiddleware(30000),
  cacheMiddleware(180),
  getResults
);

/* =====================================================
   STANDINGS

   GET /api/league/:id/standings

   Example:
   /api/league/epl/standings
===================================================== */

router.get(
  "/:id/standings",
  timeoutMiddleware(30000),
  cacheMiddleware(300),
  getStandings
);

/* =====================================================
   TOP SCORERS

   GET /api/league/:id/topscorers

   Example:
   /api/league/epl/topscorers
===================================================== */

router.get(
  "/:id/topscorers",
  timeoutMiddleware(30000),
  cacheMiddleware(3600),
  getTopScorers
);

/* =====================================================
   TOP ASSISTS

   GET /api/league/:id/topassists

   Example:
   /api/league/epl/topassists
===================================================== */

router.get(
  "/:id/topassists",
  timeoutMiddleware(30000),
  cacheMiddleware(600),
  getTopAssists
);

/* =====================================================
   TEAMS

   GET /api/league/:id/teams

   Example:
   /api/league/epl/teams
===================================================== */

router.get(
  "/:id/teams",
  timeoutMiddleware(30000),
  cacheMiddleware(600),
  getTeams
);

/* =====================================================
   STATISTICS

   GET /api/league/:id/statistics

   Example:
   /api/league/epl/statistics
===================================================== */

router.get(
  "/:id/statistics",
  timeoutMiddleware(30000),
  cacheMiddleware(900),
  getStatistics
);

/* =====================================================
   DEVELOPMENT CACHE CLEAR

   DELETE /api/league/cache

   IMPORTANT:
   This route must appear BEFORE "/:id"
   if using DELETE /api/league/cache.
===================================================== */

if (process.env.NODE_ENV !== "production") {
  router.delete("/cache", (req, res) => {
    cache.flushAll();

    console.log("🧹 League cache cleared");

    return res.json({
      success: true,
      message: "League cache cleared",
    });
  });
}

/* =====================================================
   ROUTE DEBUGGING
===================================================== */

if (process.env.NODE_ENV !== "production") {
  console.log("======================================");
  console.log("⚽ League Routes Loaded");
  console.log("======================================");
  console.log("GET /api/league/:id");
  console.log("GET /api/league/:id/fixtures");
  console.log("GET /api/league/:id/results");
  console.log("GET /api/league/:id/standings");
  console.log("GET /api/league/:id/topscorers");
  console.log("GET /api/league/:id/topassists");
  console.log("GET /api/league/:id/teams");
  console.log("GET /api/league/:id/statistics");
  console.log("======================================");
}

module.exports = router;