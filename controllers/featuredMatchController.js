const { apiGet } = require("../services/footballApi");

exports.getFeaturedMatch = async (req, res) => {
  try {
    let fixtures = await apiGet("/fixtures", {
      live: "all",
    });

    if (!Array.isArray(fixtures) || fixtures.length === 0) {
      fixtures = await apiGet("/fixtures", {
        next: 1,
      });
    }

    if (!Array.isArray(fixtures) || fixtures.length === 0) {
      return res.json({
        success: false,
        match: null,
        message: "No featured match available",
      });
    }

    const fixture = fixtures[0];

    const match = {
      fixture: fixture.fixture,
      league: fixture.league,
      home: fixture.teams.home,
      away: fixture.teams.away,
      goals: fixture.goals,
      score: fixture.score,
      status: fixture.fixture.status,
    };

    return res.json({
      success: true,
      match,
    });
  } catch (err) {
    console.error("FeaturedMatch:", err.message);

    return res.status(500).json({
      success: false,
      match: null,
      message: "Unable to load featured match",
    });
  }
};