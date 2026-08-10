const { apiGet } = require("../services/footballApi");
const formatTeam = require("../formatters/teamFormatter");

/* =====================================================
   TEAM PROFILE
===================================================== */

exports.getTeam = async (req, res) => {
  try {
    const teamId = req.params.id;
    const season = Number(req.query.season) || 2023;
    const league = Number(req.query.league) || 39;

    const [
      teamInfo,
      statistics,
      players,
      fixtures,
      transfers,
      coach,
      injuries,
      trophies,
    ] = await Promise.all([
      apiGet("/teams", { id: teamId }),
      apiGet("/teams/statistics", {
        team: teamId,
        league,
        season,
      }),
      apiGet("/players", {
        team: teamId,
        season,
      }),
      apiGet("/fixtures", {
        team: teamId,
        season,
        last: 10,
      }),
      apiGet("/transfers", {
        team: teamId,
      }),
      apiGet("/coachs", {
        team: teamId,
      }),
      apiGet("/injuries", {
        team: teamId,
        league,
        season,
      }),
      apiGet("/trophies", {
        team: teamId,
      }),
    ]);

    if (!teamInfo || teamInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    const team = formatTeam({
      team: teamInfo,
      statistics,
      players,
      fixtures,
      transfers,
      coach,
      injuries,
      trophies,
    });

    return res.json({
      success: true,
      team,
    });

  } catch (err) {
    console.error("TeamController:", err.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load team",
    });
  }
};

/* =====================================================
   TEAM PLAYERS
===================================================== */

exports.getPlayers = async (req, res) => {
  try {
    const teamId = req.params.id;
    const season = Number(req.query.season) || 2023;

    const players = await apiGet("/players", {
      team: teamId,
      season,
    });

    return res.json({
      success: true,
      players,
    });

  } catch (err) {
    console.error("Team Players:", err.message);

    return res.status(500).json({
      success: false,
      players: [],
      message: "Unable to load team players",
    });
  }
};

/* =====================================================
   TEAM STATISTICS
===================================================== */

exports.getStatistics = async (req, res) => {
  try {
    const teamId = req.params.id;
    const season = Number(req.query.season) || 2023;
    const league = Number(req.query.league) || 39;

    const stats = await apiGet("/teams/statistics", {
      team: teamId,
      league,
      season,
    });

    const statistics = {
      played:
        stats.fixtures?.played?.total || 0,

      wins:
        stats.fixtures?.wins?.total || 0,

      draws:
        stats.fixtures?.draws?.total || 0,

      losses:
        stats.fixtures?.loses?.total || 0,

      goalsFor:
        stats.goals?.for?.total?.total || 0,

      goalsAgainst:
        stats.goals?.against?.total?.total || 0,

      cleanSheets:
        stats.clean_sheet?.total || 0,

      failedToScore:
        stats.failed_to_score?.total || 0,

      points:
        (stats.fixtures?.wins?.total || 0) * 3 +
        (stats.fixtures?.draws?.total || 0),

      form:
        stats.form || "",

      biggestWin:
        stats.biggest?.wins || null,

      biggestLoss:
        stats.biggest?.loses || null,

      goals: stats.goals || {},

      cards: stats.cards || {},

      lineups: stats.lineups || [],

      home: {
        played:
          stats.fixtures?.played?.home || 0,

        wins:
          stats.fixtures?.wins?.home || 0,

        draws:
          stats.fixtures?.draws?.home || 0,

        losses:
          stats.fixtures?.loses?.home || 0,
      },

      away: {
        played:
          stats.fixtures?.played?.away || 0,

        wins:
          stats.fixtures?.wins?.away || 0,

        draws:
          stats.fixtures?.draws?.away || 0,

        losses:
          stats.fixtures?.loses?.away || 0,
      },
    };

    return res.json({
      success: true,
      statistics,
    });

  } catch (err) {
    console.error("Team Statistics:", err.message);

    return res.status(500).json({
      success: false,
      statistics: null,
      message: "Unable to load team statistics",
    });
  }
};

/* =====================================================
   TEAM FIXTURES
===================================================== */

exports.getFixtures = async (req, res) => {
  try {
    const teamId = req.params.id;
    const season = Number(req.query.season) || 2023;

    const fixtures = await apiGet("/fixtures", {
      team: teamId,
      season,
      next: 10,
    });

    return res.json({
      success: true,
      count: fixtures.length,
      fixtures,
    });

  } catch (err) {
    console.error("Team Fixtures:", err.message);

    return res.status(500).json({
      success: false,
      count: 0,
      fixtures: [],
      message: "Unable to load fixtures",
    });
  }
};

/* =====================================================
   TEAM HISTORY
===================================================== */

exports.getHistory = async (req, res) => {
  try {
    const teamId = req.params.id;

    const history = await apiGet("/fixtures/headtohead", {
      h2h: `${teamId}-${teamId}`,
      last: 10,
    });

    return res.json({
      success: true,
      history,
    });

  } catch (err) {
    console.error("Team History:", err.message);

    return res.status(500).json({
      success: false,
      history: [],
      message: "Unable to load history",
    });
  }
};

/* =====================================================
   TEAM COACH
===================================================== */

exports.getCoach = async (req, res) => {
  try {
    const coach = await apiGet("/coachs", {
      team: req.params.id,
    });

    return res.json({
      success: true,
      coach: coach[0] || null,
    });

  } catch (err) {
    console.error("Team Coach:", err.message);

    return res.status(500).json({
      success: false,
      coach: null,
      message: "Unable to load coach",
    });
  }
};

/* =====================================================
   TEAM TRANSFERS
===================================================== */

exports.getTransfers = async (req, res) => {
  try {
    const transfers = await apiGet("/transfers", {
      team: req.params.id,
    });

    return res.json({
      success: true,
      transfers,
    });

  } catch (err) {
    console.error("Team Transfers:", err.message);

    return res.status(500).json({
      success: false,
      transfers: [],
      message: "Unable to load transfers",
    });
  }
};

/* =====================================================
   TEAM INJURIES
===================================================== */

exports.getInjuries = async (req, res) => {
  try {
    const injuries = await apiGet("/injuries", {
      team: req.params.id,
      league: Number(req.query.league) || 39,
      season: Number(req.query.season) || 2023,
    });

    return res.json({
      success: true,
      injuries,
    });

  } catch (err) {
    console.error("Team Injuries:", err.message);

    return res.status(500).json({
      success: false,
      injuries: [],
      message: "Unable to load injuries",
    });
  }
};

/* =====================================================
   TEAM TROPHIES
===================================================== */

exports.getTrophies = async (req, res) => {
  try {
    const trophies = await apiGet("/trophies", {
      team: req.params.id,
    });

    return res.json({
      success: true,
      trophies,
    });

  } catch (err) {
    console.error("Team Trophies:", err.message);

    return res.status(500).json({
      success: false,
      trophies: [],
      message: "Unable to load trophies",
    });
  }
};