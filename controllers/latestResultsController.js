const { apiGet } = require("../services/footballApi");

exports.getLatestResults = async (req, res) => {
  try {
    const leagueId = req.query.league || 39;
    const season = req.query.season || 2023;

    const fixtures = await apiGet("/fixtures", {
      league: leagueId,
      season,
      last: 10,
    });

    if (!Array.isArray(fixtures) || fixtures.length === 0) {
      return res.json({
        success: false,
        matches: [],
        message: "No recent matches found",
      });
    }

    const matches = fixtures.map((fixture) => ({
      fixture: fixture.fixture,

      league: fixture.league,

      home: fixture.teams.home,

      away: fixture.teams.away,

      goals: fixture.goals,

      score: fixture.score,

      status: fixture.fixture.status,
    }));

    return res.json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (err) {
    console.error("LatestResultsController:", err.message);

    return res.status(500).json({
      success: false,
      matches: [],
      message: "Unable to load latest results",
    });
  }
};