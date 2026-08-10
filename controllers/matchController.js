const { apiGet } = require("../services/footballApi");

const formatMatch = require("../formatters/matchFormatter");

/* =====================================================
   MATCH DETAILS
===================================================== */

exports.getMatch = async (req, res) => {
  try {
    const fixtureId = req.params.id;

    const [
      fixtureResult,
      statisticsResult,
      eventsResult,
      lineupsResult,
      playersResult,
    ] = await Promise.allSettled([
      apiGet("/fixtures", {
        id: fixtureId,
      }),

      apiGet("/fixtures/statistics", {
        fixture: fixtureId,
      }),

      apiGet("/fixtures/events", {
        fixture: fixtureId,
      }),

      apiGet("/fixtures/lineups", {
        fixture: fixtureId,
      }),

      apiGet("/fixtures/players", {
        fixture: fixtureId,
      }),
    ]);

    const fixtureResponse =
      fixtureResult.status === "fulfilled"
        ? fixtureResult.value
        : [];

    const statisticsResponse =
      statisticsResult.status === "fulfilled"
        ? statisticsResult.value
        : [];

    const eventsResponse =
      eventsResult.status === "fulfilled"
        ? eventsResult.value
        : [];

    const lineupsResponse =
      lineupsResult.status === "fulfilled"
        ? lineupsResult.value
        : [];

    const playersResponse =
      playersResult.status === "fulfilled"
        ? playersResult.value
        : [];

    if (
      !Array.isArray(fixtureResponse) ||
      fixtureResponse.length === 0
    ) {
      return res.json({
        success: false,
        message: "Match not found",
        match: null,
      });
    }

    const match = formatMatch({
      fixture: fixtureResponse[0],
      statistics: statisticsResponse,
      events: eventsResponse,
      lineups: lineupsResponse,
      players: playersResponse,
    });

    return res.json({
      success: true,

      match,

      statisticsCount: statisticsResponse.length,

      eventsCount: eventsResponse.length,

      lineupsCount: lineupsResponse.length,

      playersCount: playersResponse.length,

      message: "Match loaded",
    });

  } catch (err) {
    console.error("MatchController:", err.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load match",
      match: null,

      statisticsCount: 0,
      eventsCount: 0,
      lineupsCount: 0,
      playersCount: 0,
    });
  }
};
/* =====================================================
   MATCH EVENTS
===================================================== */

exports.getEvents = async (req, res) => {
  try {
    const events = await apiGet("/fixtures/events", {
      fixture: req.params.id,
    });

    return res.json({
      success: true,
      count: events.length,
      events,
    });

  } catch (err) {
    console.error("Match Events:", err.message);

    return res.status(500).json({
      success: false,
      count: 0,
      events: [],
    });
  }
};

/* =====================================================
   MATCH TIMELINE
===================================================== */

exports.getTimeline = async (req, res) => {
  try {
    const events = await apiGet("/fixtures/events", {
      fixture: req.params.id,
    });

    return res.json({
      success: true,
      timeline: events,
    });

  } catch (err) {
    console.error("Match Timeline:", err.message);

    return res.status(500).json({
      success: false,
      timeline: [],
    });
  }
};

/* =====================================================
   MATCH STATISTICS
===================================================== */

exports.getStatistics = async (req, res) => {
  try {
    const statistics = await apiGet("/fixtures/statistics", {
      fixture: req.params.id,
    });

    return res.json({
      success: true,
      statistics,
    });

  } catch (err) {
    console.error("Match Statistics:", err.message);

    return res.status(500).json({
      success: false,
      statistics: [],
    });
  }
};

/* =====================================================
   MATCH LINEUPS
===================================================== */

exports.getLineups = async (req, res) => {
  try {
    const lineups = await apiGet("/fixtures/lineups", {
      fixture: req.params.id,
    });

    return res.json({
      success: true,
      lineups,
    });

  } catch (err) {
    console.error("Match Lineups:", err.message);

    return res.status(500).json({
      success: false,
      lineups: [],
    });
  }
};

/* =====================================================
   MATCH PLAYER RATINGS
===================================================== */

exports.getPlayerRatings = async (req, res) => {
  try {
    const players = await apiGet("/fixtures/players", {
      fixture: req.params.id,
    });

    return res.json({
      success: true,
      players,
    });

  } catch (err) {
    console.error("Match Ratings:", err.message);

    return res.status(500).json({
      success: false,
      players: [],
    });
  }
};

/* =====================================================
   MATCH HEAD TO HEAD
===================================================== */

exports.getHeadToHead = async (req, res) => {
  try {
    const fixture = await apiGet("/fixtures", {
      id: req.params.id,
    });

    if (!fixture.length) {
      return res.json({
        success: false,
        headtohead: [],
      });
    }

    const home =
      fixture[0].teams.home.id;

    const away =
      fixture[0].teams.away.id;

    const h2h = await apiGet(
      "/fixtures/headtohead",
      {
        h2h: `${home}-${away}`,
      }
    );

    return res.json({
      success: true,
      headtohead: h2h,
    });

  } catch (err) {
    console.error("HeadToHead:", err.message);

    return res.status(500).json({
      success: false,
      headtohead: [],
    });
  }
};

/* =====================================================
   MATCH STANDINGS
===================================================== */

exports.getStandings = async (req, res) => {
  try {
    const fixture = await apiGet("/fixtures", {
      id: req.params.id,
    });

    if (!fixture.length) {
      return res.json({
        success: false,
        standings: [],
      });
    }

    const league =
      fixture[0].league.id;

    const season =
      fixture[0].league.season;

    const standings = await apiGet(
      "/standings",
      {
        league,
        season,
      }
    );

    return res.json({
      success: true,
      standings,
    });

  } catch (err) {
    console.error("Match Standings:", err.message);

    return res.status(500).json({
      success: false,
      standings: [],
    });
  }
};

/* =====================================================
   MATCH PREDICTION
===================================================== */

exports.getPrediction = async (req, res) => {
  try {
    const prediction = await apiGet("/predictions", {
      fixture: req.params.id,
    });

    return res.json({
      success: true,
      prediction:
        prediction[0] || null,
    });

  } catch (err) {
    console.error("Prediction:", err.message);

    return res.status(500).json({
      success: false,
      prediction: null,
    });
  }
};

/* =====================================================
   MATCH FACTS
===================================================== */

exports.getFacts = async (req, res) => {
  try {
    const fixture = await apiGet("/fixtures", {
      id: req.params.id,
    });

    return res.json({
      success: true,
      facts:
        fixture[0] || null,
    });

  } catch (err) {
    console.error("Match Facts:", err.message);

    return res.status(500).json({
      success: false,
      facts: null,
    });
  }
};