const { apiGet } = require("../services/footballApi");

const formatLineup = require("../formatters/lineupFormatter");

/* =====================================================
   MATCH LINEUPS
===================================================== */

exports.getLineups = async (req, res) => {
  try {
    const fixtureId = req.params.id;

    const response = await apiGet("/fixtures/lineups", {
      fixture: fixtureId,
    });

    const lineups = Array.isArray(response)
      ? response.map(formatLineup)
      : [];

    return res.json({
      success: true,

      fixtureId,

      count: lineups.length,

      lineups,

      message: "Lineups loaded",
    });

  } catch (err) {
    console.error(
      "LineupsController:",
      err.message
    );

    return res.status(500).json({
      success: false,

      fixtureId: req.params.id,

      count: 0,

      lineups: [],

      message: "Unable to load lineups",
    });
  }
};