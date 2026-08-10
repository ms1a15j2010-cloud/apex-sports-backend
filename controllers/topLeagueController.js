const { apiGet } = require("../services/footballApi");

exports.getTopLeagues = async (req, res) => {
  try {
    const season = req.query.season || 2023;

    const leagues = await apiGet("/leagues", {
      current: true,
      season,
    });

    if (!Array.isArray(leagues) || leagues.length === 0) {
      return res.json({
        success: false,
        leagues: [],
        message: "No leagues found",
      });
    }

    const top = leagues
      .filter((item) => item.league)
      .slice(0, 10)
      .map((item) => ({
        id: item.league.id,
        name: item.league.name,
        logo: item.league.logo,
        type: item.league.type,
        country: item.country?.name,
        flag: item.country?.flag,
        season: item.seasons?.find((s) => s.current)?.year || season,
      }));

    return res.json({
      success: true,
      count: top.length,
      leagues: top,
    });
  } catch (err) {
    console.error("TopLeagueController:", err.message);

    return res.status(500).json({
      success: false,
      leagues: [],
      message: "Unable to load leagues",
    });
  }
};