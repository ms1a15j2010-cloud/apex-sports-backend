const { apiGet } = require("../services/footballApi");

/* =====================================================
   GLOBAL SEARCH
===================================================== */

exports.searchFootball = async (req, res) => {
  try {
    const query = (req.query.q || "").trim();

    if (!query) {
      return res.json({
        success: true,
        query: "",
        teams: [],
        players: [],
        leagues: [],
        matches: [],
        count: {
          teams: 0,
          players: 0,
          leagues: 0,
          matches: 0,
        },
      });
    }

    const [
      teamsResult,
      playersResult,
      leaguesResult,
      fixturesResult,
    ] = await Promise.allSettled([
      apiGet("/teams", {
        search: query,
      }),

      apiGet("/players", {
        search: query,
      }),

      apiGet("/leagues", {
        search: query,
      }),

      apiGet("/fixtures", {
        search: query,
      }),
    ]);

    const teams =
      teamsResult.status === "fulfilled"
        ? teamsResult.value
        : [];

    const players =
      playersResult.status === "fulfilled"
        ? playersResult.value
        : [];

    const leagues =
      leaguesResult.status === "fulfilled"
        ? leaguesResult.value
        : [];

    const matches =
      fixturesResult.status === "fulfilled"
        ? fixturesResult.value
        : [];

    return res.json({
      success: true,
      query,

      teams,
      players,
      leagues,
      matches,

      count: {
        teams: teams.length,
        players: players.length,
        leagues: leagues.length,
        matches: matches.length,
      },
    });

  } catch (err) {
    console.error("SearchController:", err.message);

    return res.status(500).json({
      success: false,
      query: req.query.q || "",

      teams: [],
      players: [],
      leagues: [],
      matches: [],

      count: {
        teams: 0,
        players: 0,
        leagues: 0,
        matches: 0,
      },

      message: "Unable to search football data",
    });
  }
};