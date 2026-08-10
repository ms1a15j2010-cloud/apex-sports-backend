require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { apiGet } = require("./services/footballApi");

const app = express();

/* =====================================================
   CONFIG
===================================================== */

const PORT = process.env.PORT || 5000;

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

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

/* =====================================================
   GLOBAL REQUEST LOGGING
===================================================== */

app.use((req, res, next) => {
  console.log(
    `➡️ ${req.method} ${req.originalUrl}`
  );

  next();
});

/* =====================================================
   GLOBAL REQUEST TIMEOUT
===================================================== */

app.use((req, res, next) => {
  res.setTimeout(60000, () => {
    if (!res.headersSent) {
      console.error(
        `⏰ Global request timeout: ${req.method} ${req.originalUrl}`
      );

      res.status(504).json({
        success: false,
        message: "Request timeout",
      });
    }
  });

  next();
});

/* =====================================================
   ENVIRONMENT CHECK
===================================================== */

if (!process.env.API_FOOTBALL_KEY) {
  console.warn(
    "⚠️ API_FOOTBALL_KEY is missing from .env"
  );
} else {
  console.log(
    "✓ API_FOOTBALL_KEY loaded"
  );
}

if (!process.env.API_HOST) {
  console.warn(
    "⚠️ API_HOST is missing from .env"
  );
} else {
  console.log(
    "✓ API_HOST:",
    process.env.API_HOST
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
===================================================== */

/*
   IMPORTANT

   These routes become:

   /api/league/epl
   /api/league/epl/fixtures
   /api/league/epl/results
   /api/league/epl/standings
   /api/league/epl/topscorers
   /api/league/epl/topassists
   /api/league/epl/teams
   /api/league/epl/statistics
*/

app.use(
  "/api/league",
  require("./routes/league")
);

/* =====================================================
   LEGACY / OLD ROUTES
===================================================== */

/*
   Keep these for compatibility with older frontend pages.

   They are separate from the new /api/league routes.
*/

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
  require("./routes/headtohead")
);

app.use(
  "/api/standings",
  require("./routes/standings")
);

app.use(
  "/api/top-scorers",
  require("./routes/topScorers")
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
   DIRECT RESULTS FALLBACK
===================================================== */

app.get(
  "/api/results/direct",
  async (req, res) => {
    try {
      console.log(
        "📊 Fetching latest results..."
      );

      const response = await apiGet(
        "/fixtures",
        {
          last: 50,
        }
      );

      return res.json({
        success: true,
        matches: response || [],
      });
    } catch (error) {
      console.error(
        "❌ Error fetching results:",
        error.message
      );

      return res.status(500).json({
        success: false,
        matches: [],
        error: error.message,
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

    return res.status(404).json({
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

    return res.status(500).json({
      success: false,
      message:
        "Internal Server Error",
    });
  }
);

/* =====================================================
   START SERVER
===================================================== */

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
      `🚀 Network: http://192.168.1.3:${PORT}`
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