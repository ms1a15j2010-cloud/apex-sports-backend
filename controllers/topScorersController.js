const { apiGet } = require("../services/footballApi");

const formatTopScorer = require("../formatters/topScorerFormatter");

/* =====================================================
   FULL TOP SCORERS
===================================================== */

exports.getTopScorers = async (req, res) => {
  try {
    const leagueId = req.params.id;
    const season = req.query.season || 2023;

    let response = [];

    try {
      response = await apiGet("/players/topscorers", {
        league: leagueId,
        season,
      });
    } catch (err) {
      console.error("TopScorers API:", err.message);
    }

    if (!Array.isArray(response) || response.length === 0) {
      return res.json({
        success: false,
        count: 0,
        players: [],
        message: "No top scorers found",
      });
    }

    const players = response
      .map((player) => {
        try {
          return formatTopScorer(player);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    return res.json({
      success: true,
      count: players.length,
      players,
      message: "Top scorers loaded",
    });

  } catch (err) {
    console.error("TopScorersController:", err);

    return res.json({
      success: false,
      count: 0,
      players: [],
      message: "Unable to load top scorers",
    });
  }
};