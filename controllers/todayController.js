const { apiGet } = require("../services/footballApi");
const formatFixture = require("../formatters/fixtureFormatter");

exports.getTodayMatches = async (req, res) => {
  try {
    const today =
      req.query.date ||
      new Date().toISOString().split("T")[0];

    const leagueId = req.query.league;
    const season = req.query.season;

    const params = {
      date: today,
    };

    if (leagueId) params.league = leagueId;
    if (season) params.season = season;

    const response = await apiGet("/fixtures", params);

    if (!Array.isArray(response) || response.length === 0) {
      return res.json({
        success: false,
        date: today,
        count: 0,
        matches: [],
        message: "No matches scheduled today",
      });
    }

    const matches = response.map(formatFixture);

    return res.json({
      success: true,
      date: today,
      count: matches.length,
      matches,
    });

  } catch (err) {
    console.error("TodayController:", err.message);

    return res.status(500).json({
      success: false,
      date:
        req.query.date ||
        new Date().toISOString().split("T")[0],
      count: 0,
      matches: [],
      message: "Unable to load today's matches",
    });
  }
};