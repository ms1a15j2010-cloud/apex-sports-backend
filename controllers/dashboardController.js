const { apiGet } = require("../services/footballApi");

exports.getDashboardHero = async (req, res) => {
  try {
    const leagueId = 39;
    const season = 2023;

    const [
      leagues,
      teams,
      playersData,
      fixtures,
    ] = await Promise.all([
      apiGet("/leagues", {
        id: leagueId,
        season,
      }),

      apiGet("/teams", {
        league: leagueId,
        season,
      }),

      apiGet(
        "/players",
        {
          league: leagueId,
          season,
          page: 1,
        },
        2,
        {
          fullResponse: true,
        }
      ),

      apiGet("/fixtures", {
        league: leagueId,
        season,
      }),
    ]);

    const playerCount =
      playersData?.paging?.total ||
      playersData?.results ||
      playersData?.response?.length ||
      0;

    return res.json({
      success: true,
      hero: {
        leagues: leagues.length,
        teams: teams.length,
        players: playerCount,
        fixtures: fixtures.length,
      },
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      hero: {
        leagues: 0,
        teams: 0,
        players: 0,
        fixtures: 0,
      },
    });
  }
};