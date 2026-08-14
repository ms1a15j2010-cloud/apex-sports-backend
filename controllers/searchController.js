const {
  searchFootball,
} = require("../services/footballDataApi");

/* =====================================================
GLOBAL SEARCH
===================================================== */

exports.searchFootball = async (
  req,
  res
) => {
  try {
    const query = String(
      req.query.q || ""
    ).trim();

    /* =================================================
       EMPTY SEARCH
    ================================================= */

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

    console.log(
      `🔎 Global search: "${query}"`
    );

    /* =================================================
       SEARCH SERVICE
    ================================================= */

    const data =
      await searchFootball(
        query
      );

    /* =================================================
       SAFE ARRAYS
    ================================================= */

    const teams =
      Array.isArray(
        data?.teams
      )
        ? data.teams
        : [];

    const players =
      Array.isArray(
        data?.players
      )
        ? data.players
        : [];

    const leagues =
      Array.isArray(
        data?.leagues
      )
        ? data.leagues
        : [];

    const matches =
      Array.isArray(
        data?.matches
      )
        ? data.matches
        : [];

    /* =================================================
       RESPONSE

       Keep the existing frontend contract unchanged.
    ================================================= */

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
    console.error(
      "❌ SearchController:",
      err.message
    );

    return res.status(500).json({
      success: false,

      query:
        req.query.q || "",

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

      message:
        "Unable to search football data",
    });
  }
};