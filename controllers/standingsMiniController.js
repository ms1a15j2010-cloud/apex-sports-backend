const { apiGet } = require("../services/footballApi");

exports.getStandingsMini = async (req, res) => {
  try {
    const leagueId = req.query.league || 39;
    const season = req.query.season || 2023;

    const response = await apiGet("/standings", {
      league: leagueId,
      season,
    });

    if (!Array.isArray(response) || response.length === 0) {
      return res.json({
        success: false,
        standings: [],
        message: "No standings found",
      });
    }

    const table =
      response[0]?.league?.standings?.[0] || [];

    const standings = table.slice(0, 5).map((club) => ({
      rank: club.rank,
      points: club.points,

      team: {
        id: club.team.id,
        name: club.team.name,
        logo: club.team.logo,
      },

      played: club.all.played,
      won: club.all.win,
      draw: club.all.draw,
      lost: club.all.lose,

      goalsFor: club.all.goals.for,
      goalsAgainst: club.all.goals.against,
      goalDifference: club.goalsDiff,

      form: club.form,
    }));

    return res.json({
      success: true,
      count: standings.length,
      standings,
    });

  } catch (err) {
    console.error("StandingsMiniController:", err.message);

    return res.status(500).json({
      success: false,
      standings: [],
      message: "Unable to load standings",
    });
  }
};