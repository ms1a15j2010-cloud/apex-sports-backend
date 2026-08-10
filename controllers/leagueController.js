const { apiGet, getCurrentSeason } = require("../services/footballApi");
const formatLeague = require("../formatters/leagueFormatter");
const formatFixture = require("../formatters/fixtureFormatter");
const { getLeagueId } = require("../utils/leagueMap");

/* =========================================================
   CACHE & HELPER FUNCTIONS
========================================================= */

function withTimeout(promise, ms = 15000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`API timeout after ${ms}ms`)), ms);
    }),
  ]);
}

function getResponseData(response) {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.response)) return response.response;
  if (response.data && Array.isArray(response.data.response)) {
    return response.data.response;
  }
  return [];
}

/* =========================================================
   SEASON RESOLVER (Synchronous - No API calls)
========================================================= */

function resolveSeason(leagueId, requestedSeason) {
  const MIN_SEASON = 2022;
  const MAX_SEASON = 2024;

  let season = Number(requestedSeason) || getCurrentSeason();

  if (season > MAX_SEASON) {
    console.log(
      `⚠️ Requested season ${season} is newer than supported season ${MAX_SEASON}`
    );
    season = MAX_SEASON;
  }

  if (season < MIN_SEASON) {
    season = MIN_SEASON;
  }

  console.log(`📅 Using season ${season} for league ${leagueId}`);
  return season;
}

/* =========================================================
   SAFE API GET HELPER
========================================================= */

async function safeApiGet(endpoint, params, label) {
  try {
    console.log(`🔄 Loading ${label}...`);
    const response = await withTimeout(apiGet(endpoint, params), 15000);
    const data = getResponseData(response);
    console.log(`✅ ${label}: ${data.length}`);
    return data;
  } catch (error) {
    console.error(`❌ ${label} failed:`, error.message);
    return [];
  }
}

async function loadFixtures(leagueId, season, params = {}) {
  return await safeApiGet(
    "/fixtures",
    { league: leagueId, season, ...params },
    "Fixtures"
  );
}

async function loadPlayers(endpoint, leagueId, season, label) {
  return await safeApiGet(endpoint, { league: leagueId, season }, label);
}

/* =========================================================
   GET LEAGUE
========================================================= */

exports.getLeague = async (req, res) => {
  try {
    const leagueId = getLeagueId(req.params.id);

    if (!leagueId) {
      return res.status(400).json({
        success: false,
        league: null,
        message: "Invalid league identifier",
      });
    }

    const requestedSeason =
      parseInt(req.query.season, 10) || getCurrentSeason();
    const season = resolveSeason(leagueId, requestedSeason);

    console.log(`🏆 Loading league ${leagueId} | Season ${season}`);

    // Single league request
    const leagueResponse = await apiGet(
      "/leagues",
      { id: leagueId, season },
      2,
      { fullResponse: true }
    );

    // API Daily Limit Check
    if (leagueResponse?.errors && Object.keys(leagueResponse.errors).length > 0) {
      const requestError = String(
        leagueResponse.errors?.requests || ""
      ).toLowerCase();

      if (requestError.includes("request limit")) {
        return res.status(503).json({
          success: false,
          season,
          league: null,
          apiLimitReached: true,
          message:
            "API-Football daily request limit reached. Please try again after the API quota resets.",
        });
      }
    }

    const leagues = Array.isArray(leagueResponse?.response)
      ? leagueResponse.response
      : [];

    if (leagues.length === 0) {
      return res.status(404).json({
        success: false,
        season,
        league: null,
        message: "League not found for this season",
      });
    }

    const leagueInfo = leagues[0];

    // Load additional data independently
    const [standings, scorers, assists, fixtures, teams] = await Promise.all([
      safeApiGet("/standings", { league: leagueId, season }, "Standings"),
      safeApiGet("/players/topscorers", { league: leagueId, season }, "Top Scorers"),
      safeApiGet("/players/topassists", { league: leagueId, season }, "Top Assists"),
      safeApiGet("/fixtures", { league: leagueId, season, last: 100 }, "Fixtures"),
      safeApiGet("/teams", { league: leagueId, season }, "Teams"),
    ]);

    const league = formatLeague(
      leagueInfo,
      standings,
      scorers,
      fixtures,
      teams,
      assists
    );

    console.log("======================================");
    console.log("📊 League Data Loaded");
    console.log("League    :", leagueInfo.league?.name || leagueId);
    console.log("League ID :", leagueId);
    console.log("Season    :", season);
    console.log("Standings :", standings.length);
    console.log("Scorers   :", scorers.length);
    console.log("Assists   :", assists.length);
    console.log("Fixtures  :", fixtures.length);
    console.log("Teams     :", teams.length);
    console.log("======================================");

    return res.json({
      success: true,
      season,
      league,
    });
  } catch (error) {
    console.error("🔥 getLeague Error:", error.message);
    return res.status(500).json({
      success: false,
      season: null,
      league: null,
      message: "Unable to load league",
    });
  }
};

/* =========================================================
   GET FIXTURES
========================================================= */

exports.getFixtures = async (req, res) => {
  try {
    const leagueId = getLeagueId(req.params.id);
    if (!leagueId) {
      return res.status(400).json({
        success: false,
        fixtures: [],
        message: "Invalid league identifier",
      });
    }

    const requestedSeason =
      parseInt(req.query.season, 10) || getCurrentSeason();
    const season = resolveSeason(leagueId, requestedSeason);

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const fixtures = await loadFixtures(leagueId, season, { last: 100 });

    const formatted = fixtures
      .map((fixture) => {
        try {
          return formatFixture(fixture);
        } catch (error) {
          console.error("❌ Fixture formatting error:", error.message);
          return null;
        }
      })
      .filter(Boolean);

    const start = (page - 1) * limit;
    const end = start + limit;

    return res.json({
      success: true,
      season,
      page,
      limit,
      total: formatted.length,
      count: formatted.slice(start, end).length,
      fixtures: formatted.slice(start, end),
    });
  } catch (error) {
    console.error("🔥 getFixtures:", error.message);
    return res.status(500).json({
      success: false,
      fixtures: [],
      message: "Unable to load fixtures",
    });
  }
};

/* =========================================================
   GET RESULTS
========================================================= */

exports.getResults = async (req, res) => {
  try {
    const leagueId = getLeagueId(req.params.id);
    if (!leagueId) {
      return res.status(400).json({
        success: false,
        results: [],
        message: "Invalid league identifier",
      });
    }

    const requestedSeason =
      parseInt(req.query.season, 10) || getCurrentSeason();
    const season = resolveSeason(leagueId, requestedSeason);

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const fixtures = await loadFixtures(leagueId, season, { last: 100 });

    const formatted = fixtures
      .map((fixture) => {
        try {
          return formatFixture(fixture);
        } catch (error) {
          console.error("❌ Result formatting error:", error.message);
          return null;
        }
      })
      .filter(Boolean);

    const start = (page - 1) * limit;
    const end = start + limit;
    const results = formatted.slice(start, end);

    return res.json({
      success: true,
      season,
      page,
      limit,
      total: formatted.length,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("🔥 getResults:", error.message);
    return res.status(500).json({
      success: false,
      results: [],
      message: "Unable to load results",
    });
  }
};

/* =========================================================
   GET STANDINGS
========================================================= */

exports.getStandings = async (req, res) => {
  try {
    const leagueId = getLeagueId(req.params.id);
    if (!leagueId) {
      return res.status(400).json({
        success: false,
        standings: [],
        message: "Invalid league identifier",
      });
    }

    const requestedSeason =
      parseInt(req.query.season, 10) || getCurrentSeason();
    const season = resolveSeason(leagueId, requestedSeason);

    const response = await safeApiGet(
      "/standings",
      { league: leagueId, season },
      "Standings"
    );

    const table = response?.[0]?.league?.standings?.[0] || [];

    return res.json({
      success: true,
      season,
      count: table.length,
      standings: table,
    });
  } catch (error) {
    console.error("🔥 getStandings:", error.message);
    return res.status(500).json({
      success: false,
      season: null,
      standings: [],
      message: "Unable to load standings",
    });
  }
};

/* =========================================================
   GET TOP SCORERS
========================================================= */

exports.getTopScorers = async (req, res) => {
  try {
    const leagueId = getLeagueId(req.params.id);
    if (!leagueId) {
      return res.status(400).json({
        success: false,
        players: [],
        message: "Invalid league identifier",
      });
    }

    const requestedSeason =
      parseInt(req.query.season, 10) || getCurrentSeason();
    const season = resolveSeason(leagueId, requestedSeason);

    const players = await loadPlayers(
      "/players/topscorers",
      leagueId,
      season,
      "Top Scorers"
    );

    return res.json({
      success: true,
      season,
      count: players.length,
      players,
    });
  } catch (error) {
    console.error("🔥 getTopScorers:", error.message);
    return res.status(500).json({
      success: false,
      season: null,
      players: [],
      message: "Unable to load top scorers",
    });
  }
};

/* =========================================================
   GET TOP ASSISTS
========================================================= */

exports.getTopAssists = async (req, res) => {
  try {
    const leagueId = getLeagueId(req.params.id);
    if (!leagueId) {
      return res.status(400).json({
        success: false,
        players: [],
        message: "Invalid league identifier",
      });
    }

    const requestedSeason =
      parseInt(req.query.season, 10) || getCurrentSeason();
    const season = resolveSeason(leagueId, requestedSeason);

    const players = await loadPlayers(
      "/players/topassists",
      leagueId,
      season,
      "Top Assists"
    );

    return res.json({
      success: true,
      season,
      count: players.length,
      players,
    });
  } catch (error) {
    console.error("🔥 getTopAssists:", error.message);
    return res.status(500).json({
      success: false,
      season: null,
      players: [],
      message: "Unable to load top assists",
    });
  }
};

/* =========================================================
   GET TEAMS
========================================================= */

exports.getTeams = async (req, res) => {
  try {
    const leagueId = getLeagueId(req.params.id);
    if (!leagueId) {
      return res.status(400).json({
        success: false,
        teams: [],
        message: "Invalid league identifier",
      });
    }

    const requestedSeason =
      parseInt(req.query.season, 10) || getCurrentSeason();
    const season = resolveSeason(leagueId, requestedSeason);

    const teams = await safeApiGet(
      "/teams",
      { league: leagueId, season },
      "Teams"
    );

    return res.json({
      success: true,
      season,
      count: teams.length,
      teams,
    });
  } catch (error) {
    console.error("🔥 getTeams:", error.message);
    return res.status(500).json({
      success: false,
      season: null,
      teams: [],
      message: "Unable to load teams",
    });
  }
};

/* =========================================================
   GET STATISTICS
========================================================= */

exports.getStatistics = async (req, res) => {
  try {
    const leagueId = getLeagueId(req.params.id);
    if (!leagueId) {
      return res.status(400).json({
        success: false,
        statistics: {},
        message: "Invalid league identifier",
      });
    }

    const requestedSeason =
      parseInt(req.query.season, 10) || getCurrentSeason();
    const season = resolveSeason(leagueId, requestedSeason);

    const fixtures = await loadFixtures(leagueId, season, { last: 300 });

    const stats = {
      matches: 0,
      goals: 0,
      homeGoals: 0,
      awayGoals: 0,
      homeWins: 0,
      awayWins: 0,
      draws: 0,
      cleanSheets: 0,
      avgGoals: 0,
      highestScoringMatch: 0,
    };

    fixtures.forEach((fixture) => {
      const home = fixture.goals?.home ?? null;
      const away = fixture.goals?.away ?? null;

      if (home === null || away === null) return;

      const totalGoals = home + away;
      stats.matches++;
      stats.goals += totalGoals;
      stats.homeGoals += home;
      stats.awayGoals += away;

      if (home > away) stats.homeWins++;
      else if (away > home) stats.awayWins++;
      else stats.draws++;

      if (home === 0 || away === 0) stats.cleanSheets++;
      if (totalGoals > stats.highestScoringMatch) stats.highestScoringMatch = totalGoals;
    });

    if (stats.matches > 0) {
      stats.avgGoals = Number((stats.goals / stats.matches).toFixed(2));
    }

    return res.json({
      success: true,
      season,
      statistics: stats,
    });
  } catch (error) {
    console.error("🔥 getStatistics:", error.message);
    return res.status(500).json({
      success: false,
      season: null,
      statistics: {},
      message: "Unable to load league statistics",
    });
  }
};