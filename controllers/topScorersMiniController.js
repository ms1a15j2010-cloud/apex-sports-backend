const { apiGet } = require("../services/footballApi");

exports.getTopScorersMini = async (req, res) => {
  try {
    const leagueId = req.query.league || 39;
    const season = req.query.season || 2023;

    const response = await apiGet("/players/topscorers", {
      league: leagueId,
      season,
    });

    if (!Array.isArray(response) || response.length === 0) {
      return res.json({
        success: false,
        players: [],
        message: "No top scorers found",
      });
    }

    const players = response.slice(0, 10).map((item) => ({
      player: {
        id: item.player.id,
        name: item.player.name,
        firstname: item.player.firstname,
        lastname: item.player.lastname,
        age: item.player.age,
        nationality: item.player.nationality,
        photo: item.player.photo,
      },

      statistics: item.statistics,

      team: {
        id: item.statistics?.[0]?.team?.id,
        name: item.statistics?.[0]?.team?.name,
        logo: item.statistics?.[0]?.team?.logo,
      },

      league: {
        id: item.statistics?.[0]?.league?.id,
        name: item.statistics?.[0]?.league?.name,
        logo: item.statistics?.[0]?.league?.logo,
      },

      goals:
        item.statistics?.[0]?.goals?.total || 0,

      assists:
        item.statistics?.[0]?.goals?.assists || 0,

      appearances:
        item.statistics?.[0]?.games?.appearences || 0,
    }));

    return res.json({
      success: true,
      count: players.length,
      players,
    });

  } catch (err) {
    console.error("TopScorersMiniController:", err.message);

    return res.status(500).json({
      success: false,
      players: [],
      message: "Unable to load top scorers",
    });
  }
};