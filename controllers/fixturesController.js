const { apiGet, getCurrentSeason } = require("../services/footballApi");
const formatFixture = require("../formatters/fixtureFormatter");
const { getLeagueId } = require("../utils/leagueMap");

/* =====================================================
   GET LEAGUE FIXTURES
   ===================================================== */

exports.getFixtures = async (req, res) => {
  try {
    /* ---------------------------------------------
       Resolve league slug → numeric ID
       --------------------------------------------- */

    const leagueId = getLeagueId(req.params.league);

    if (!leagueId) {
      return res.status(400).json({
        success: false,
        season: null,
        league: null,
        fixtures: [],
        message: "Invalid league identifier",
      });
    }

    /* ---------------------------------------------
       Season
       --------------------------------------------- */

    const season =
  parseInt(req.query.season, 10) || await getCurrentSeason();

console.log(
  `Loading fixtures | League ${leagueId} | Season ${season}`
);

    /* ---------------------------------------------
       Fetch fixtures
       --------------------------------------------- */

    const response = await apiGet("/fixtures", {
  league: leagueId,
  season,
  from: `${season}-08-01`,
  to: `${season + 1}-05-31`,
});

    /* ---------------------------------------------
       Safety check
       --------------------------------------------- */

    if (!Array.isArray(response)) {
      console.warn(
        "⚠️ Fixtures API returned unexpected data"
      );

      return res.json({
        success: true,
        season,
        league: null,
        count: 0,
        fixtures: [],
        message: "No fixtures available",
      });
    }

    /* ---------------------------------------------
       Format fixtures
       --------------------------------------------- */

    const fixtures = response
      .map((fixture) => {
        try {
          return formatFixture(fixture);
        } catch (err) {
          console.error(
            "❌ Fixture formatting error:",
            err.message
          );

          return null;
        }
      })
      .filter(Boolean);

    /* ---------------------------------------------
       Pagination
       --------------------------------------------- */

    const page =
      parseInt(req.query.page, 10) || 1;

    const limit =
      parseInt(req.query.limit, 10) || 10;

    const start =
      (page - 1) * limit;

    const end =
      start + limit;

    const paginatedFixtures =
      fixtures.slice(start, end);

    /* ---------------------------------------------
       League information
       --------------------------------------------- */

    let league = null;

    if (response.length > 0) {
      const first = response[0];

      if (first.league) {
        league = {
          id: first.league.id,
          name: first.league.name,
          country: first.league.country,
          logo: first.league.logo,
          flag: first.league.flag,
          season: first.league.season || season,
        };
      }
    }

    /* ---------------------------------------------
       Response
       --------------------------------------------- */

    console.log(
      `✅ Fixtures loaded | ${fixtures.length} total`
    );

    return res.json({
      success: true,
      season,
      page,
      limit,
      total: fixtures.length,
      count: paginatedFixtures.length,
      league,
      fixtures: paginatedFixtures,
    });

  } catch (err) {
    console.error(
      "🔥 FixturesController:",
      err.message
    );

    return res.status(500).json({
      success: false,
      season: null,
      league: null,
      page: 1,
      limit: 10,
      total: 0,
      count: 0,
      fixtures: [],
      message: "Unable to load fixtures",
    });
  }
};