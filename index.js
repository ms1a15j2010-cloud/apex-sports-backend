require("dotenv").config();

const express = require("express");
const cors = require("cors");

const featuredMatchRoutes =
  require("./routes/featuredMatch");

const {
  getFinishedMatches,
} = require("./services/footballDataApi");

const app = express();

/* =====================================================
CONFIG
===================================================== */

const PORT =
  Number(process.env.PORT) || 5000;

/* =====================================================
CORS
===================================================== */

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/* =====================================================
BODY PARSER
===================================================== */

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

/* =====================================================
GLOBAL REQUEST LOGGING
===================================================== */

app.use(
  (req, res, next) => {
    console.log(
      `➡️ ${req.method} ${req.originalUrl}`
    );

    next();
  }
);

/* =====================================================
GLOBAL REQUEST TIMEOUT

60 seconds
===================================================== */

app.use(
  (req, res, next) => {
    res.setTimeout(
      60000,
      () => {
        if (!res.headersSent) {
          console.error(
            `⏰ Global request timeout: ${req.method} ${req.originalUrl}`
          );

          return res
            .status(504)
            .json({
              success: false,
              message: "Request timeout",
            });
        }
      }
    );

    next();
  }
);

/* =====================================================
FOOTBALL-DATA.ORG ENVIRONMENT CHECK
===================================================== */

if (
  !process.env.FOOTBALL_DATA_API_TOKEN
) {
  console.warn(
    "⚠️ FOOTBALL_DATA_API_TOKEN is missing"
  );
} else {
  console.log(
    "✓ FOOTBALL_DATA_API_TOKEN loaded"
  );
}

/* =====================================================
BASIC ROUTES
===================================================== */

app.use(
  "/api/hello",
  require("./routes/hello")
);

app.use(
  "/api/images",
  require("./routes/images")
);

/* =====================================================
MAIN API ROUTES
===================================================== */

app.use(
  "/api/dashboard",
  require("./routes/dashboard")
);

app.use(
  "/api/live",
  require("./routes/live")
);

app.use(
  "/api/today",
  require("./routes/today")
);

app.use(
  "/api/match",
  require("./routes/match")
);

app.use(
  "/api/team",
  require("./routes/team")
);

app.use(
  "/api/player",
  require("./routes/player")
);

app.use(
  "/api/search",
  require("./routes/search")
);

/* =====================================================
LEAGUE ROUTES

Available examples:

/api/league/epl
/api/league/epl/fixtures
/api/league/epl/results
/api/league/epl/standings
/api/league/epl/topscorers
/api/league/epl/topassists
/api/league/epl/teams
/api/league/epl/statistics
===================================================== */

app.use(
  "/api/league",
  require("./routes/league")
);

/* =====================================================
STANDINGS ROUTES
===================================================== */

app.use(
  "/api/standings",
  require("./routes/standings")
);

/* =====================================================
OTHER ROUTES
===================================================== */

app.use(
  "/api/fixtures",
  require("./routes/fixtures")
);

app.use(
  "/api/results",
  require("./routes/results")
);

app.use(
  "/api/headtohead",
  require("./routes/headToHead")
);

app.use(
  "/api/top-scorers",
  require("./routes/topScorers")
);

app.use(
  "/api/featured-match",
  featuredMatchRoutes
);

app.use(
  "/api/top-scorers-mini",
  require("./routes/topScorersMini")
);

app.use(
  "/api/top-leagues",
  require("./routes/topLeagues")
);

app.use(
  "/api/trending-teams",
  require("./routes/trendingTeams")
);

/* =====================================================
DIRECT RESULTS ENDPOINT

football-data.org
===================================================== */

app.get(
  "/api/results/direct",
  async (req, res) => {
    try {
      console.log(
        "📊 Fetching latest results from football-data.org..."
      );

      const seasonParam =
        Number(req.query.season);

      const season =
        Number.isInteger(seasonParam) &&
        seasonParam >= 1900 &&
        seasonParam <= 2100
          ? seasonParam
          : new Date().getFullYear();

      const matches =
        await getFinishedMatches({
          season,
          limit: 50,
        });

      return res.json({
        success: true,
        season,
        count: matches.length,
        matches,
        source: "football-data.org",
        message: "Latest results loaded",
      });
    } catch (error) {
      console.error(
        "❌ Error fetching results from football-data.org:",
        error?.response?.data ||
          error?.message ||
          error
      );

      return res
        .status(500)
        .json({
          success: false,
          season:
            req.query.season || null,
          count: 0,
          matches: [],
          source: "football-data.org",
          message:
            "Unable to load latest results",
          error:
            error?.response?.data ||
            error?.message ||
            "Unknown error",
        });
    }
  }
);

/* =====================================================
HEALTH CHECK
===================================================== */

app.get(
  "/api/health",
  (req, res) => {
    return res.json({
      success: true,
      status: "OK",
      service: "Apex Sports Backend",
      timestamp: new Date().toISOString(),
    });
  }
);

/* =====================================================
ROOT
===================================================== */

app.get(
  "/",
  (req, res) => {
    return res.json({
      success: true,
      message:
        "⚽ Apex Sports Backend Running",
      version: "2.0.0",
    });
  }
);

/* =====================================================
404 HANDLER
===================================================== */

app.use(
  (req, res) => {
    console.warn(
      `❌ 404: ${req.method} ${req.originalUrl}`
    );

    return res
      .status(404)
      .json({
        success: false,
        message:
          `Route ${req.method} ${req.originalUrl} not found`,
      });
  }
);

/* =====================================================
GLOBAL ERROR HANDLER
===================================================== */

app.use(
  (err, req, res, next) => {
    console.error(
      "🔥 Server Error:",
      err
    );

    if (res.headersSent) {
      return next(err);
    }

    return res
      .status(500)
      .json({
        success: false,
        message:
          "Internal Server Error",
      });
  }
);

/* =====================================================
START SERVER / VERCEL HANDLER
===================================================== */

/*
LOCAL DEVELOPMENT
-----------------
When running locally:

npm start

Express listens on:

http://localhost:5000

VERCEL
------
When deployed on Vercel, Vercel imports
the Express application instead of using
app.listen().
*/

if (!process.env.VERCEL) {
  app.listen(
    PORT,
    "0.0.0.0",
    () => {
      console.log("");
      console.log(
        "======================================"
      );
      console.log(
        "⚽ APEX SPORTS BACKEND"
      );
      console.log(
        "======================================"
      );
      console.log(
        `🚀 Local: http://localhost:${PORT}`
      );
      console.log(
        `🚀 API: http://localhost:${PORT}/api`
      );
      console.log(
        "======================================"
      );
      console.log("");
    }
  );
}

/* =====================================================
EXPORT EXPRESS APP
===================================================== */

module.exports = app;