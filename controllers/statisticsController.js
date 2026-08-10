const { apiGet } = require("../services/footballApi");

const formatStatistics = require("../formatters/statisticsFormatter");

/* =====================================================
   MATCH STATISTICS
===================================================== */

exports.getStatistics = async (req, res) => {
  try {
    const fixtureId = req.params.id;

    const response = await apiGet("/fixtures/statistics", {
      fixture: fixtureId,
    });

    const statistics = Array.isArray(response)
      ? response.map(formatStatistics)
      : [];

    return res.json({
      success: true,

      fixtureId,

      count: statistics.length,

      statistics,

      message: "Statistics loaded",
    });

  } catch (err) {
    console.error(
      "StatisticsController:",
      err.message
    );

    return res.status(500).json({
      success: false,

      fixtureId: req.params.id,

      count: 0,

      statistics: [],

      message: "Unable to load statistics",
    });
  }
};