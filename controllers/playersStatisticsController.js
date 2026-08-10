const { apiGet } = require("../services/footballApi");

const formatPlayerStatistics = require("../formatters/playerStatisticsFormatter");

/* =====================================================
   PLAYER STATISTICS
===================================================== */

exports.getPlayerStatistics = async (req, res) => {
  try {
    const fixtureId = req.params.id;

    const response = await apiGet("/fixtures/players", {
      fixture: fixtureId,
    });

    const players = Array.isArray(response)
      ? response.map(formatPlayerStatistics)
      : [];

    return res.json({
      success: true,

      fixtureId,

      count: players.length,

      players,

      message: "Player statistics loaded",
    });

  } catch (err) {
    console.error(
      "PlayerStatisticsController:",
      err.message
    );

    return res.status(500).json({
      success: false,

      fixtureId: req.params.id,

      count: 0,

      players: [],

      message: "Unable to load player statistics",
    });
  }
};