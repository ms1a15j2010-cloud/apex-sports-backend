const { apiGet } = require("../services/footballApi");

exports.getTrendingTeams = async (req, res) => {
  try {
    const season = 2023;

    const teamIds = [
      42,    // Arsenal
      40,    // Liverpool
      33,    // Manchester United
      50,    // Manchester City
      541,   // Real Madrid
      529,   // Barcelona
      157,   // Bayern Munich
      85,    // PSG
    ];

    const responses = await Promise.all(
      teamIds.map(id =>
        apiGet("/teams", {
          id,
          season,
        })
      )
    );

    const teams = responses
      .flat()
      .map(item => ({
        id: item.team.id,
        name: item.team.name,
        logo: item.team.logo,
        country: item.team.country,
        founded: item.team.founded,
        national: item.team.national,
        venue: item.venue,
      }));

    return res.json({
      success: true,
      count: teams.length,
      teams,
    });

  } catch (err) {

    console.error("Trending Teams:", err.message);

    return res.status(500).json({
      success: false,
      teams: [],
    });

  }
};