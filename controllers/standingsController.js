const { apiGet } = require("../services/footballApi");

const formatStanding = require("../formatters/standingsFormatter");

/* =====================================================
   FULL LEAGUE STANDINGS
===================================================== */

exports.getStandings = async (req, res) => {
  try {
    const leagueId = req.params.id;
    const season = req.query.season || 2023;

    let response = [];

    try {
      response = await apiGet("/standings", {
        league: leagueId,
        season,
      });
    } catch (err) {
      console.error("Standings API:", err.message);
    }

    if (
      !Array.isArray(response) ||
      response.length === 0 ||
      !response[0]?.league?.standings?.length
    ) {
      return res.json({
        success: false,
        count: 0,
        standings: [],
        message: "No standings available",
      });
    }

    const standings = response[0].league.standings[0]
      .map((team) => {
        try {
          return formatStanding(team);
        } catch (err) {
          return null;
        }
      })
      .filter(Boolean);

    return res.json({
      success: true,
      league: {
        id: response[0].league.id,
        name: response[0].league.name,
        logo: response[0].league.logo,
        country: response[0].league.country,
        season: response[0].league.season,
      },
      count: standings.length,
      standings,
      message: "Standings loaded",
    });

  } catch (err) {
    console.error("StandingsController:", err);

    return res.json({
      success: false,
      count: 0,
      standings: [],
      message: "Unable to load standings",
    });
  }
};