/**
 * =====================================================
 * League Formatter
 * Converts raw API-Football data into a consistent object
 * used throughout the frontend.
 * =====================================================
 */

function formatLeague(
  league,
  standings = [],
  topScorers = [],
  fixtures = [],
  teams = [],
  topAssists = [],
  statistics = {}
) {
  if (!league || !league.league) {
    return null;
  }

  /* =====================================================
     CURRENT / LATEST SEASON
  ===================================================== */

  let season = null;

  if (Array.isArray(league.seasons)) {
    const current = league.seasons.find(
      (s) => s.current === true
    );

    if (current) {
      season = current.year;
    } else if (league.seasons.length) {
      season = [...league.seasons]
        .sort((a, b) => b.year - a.year)[0].year;
    }
  }

  /* =====================================================
     NORMALIZE STANDINGS
  ===================================================== */

  let table = [];

  if (standings.length) {
    if (standings[0]?.league?.standings?.[0]) {
      table = standings[0].league.standings[0];
    } else if (standings[0]?.standings?.[0]) {
      table = standings[0].standings[0];
    } else if (Array.isArray(standings[0])) {
      table = standings[0];
    } else {
      table = standings;
    }
  }

  /* =====================================================
     NORMALIZE FIXTURES
  ===================================================== */

  const fixtureList = Array.isArray(fixtures)
    ? fixtures
    : [];

  const upcomingFixtures = fixtureList
    .filter(
      (match) =>
        !["FT", "AET", "PEN"].includes(
          match.fixture?.status?.short
        )
    )
    .slice(0, 10);

  const recentResults = fixtureList
    .filter((match) =>
      ["FT", "AET", "PEN"].includes(
        match.fixture?.status?.short
      )
    )
    .slice(0, 10);

  /* =====================================================
     RETURN
  ===================================================== */

  return {
    id: league.league.id,

    name: league.league.name,

    type: league.league.type,

    logo: league.league.logo,

    season,

    country: {
      name: league.country?.name || "",

      code: league.country?.code || "",

      flag: league.country?.flag || "",
    },

    standings: table,

    fixtures: upcomingFixtures,

    results: recentResults,

    teams,

    topScorers,

    topAssists,

    statistics,

    counts: {
      standings: table.length,
      fixtures: upcomingFixtures.length,
      results: recentResults.length,
      teams: teams.length,
      scorers: topScorers.length,
      assists: topAssists.length,
    },
  };
}

module.exports = formatLeague;