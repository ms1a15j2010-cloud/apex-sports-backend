module.exports = function formatFeaturedMatch(fixture) {
  if (!fixture) return null;

  return {
    id: fixture.fixture.id,

    date: fixture.fixture.date,

    timestamp: fixture.fixture.timestamp,

    referee: fixture.fixture.referee,

    timezone: fixture.fixture.timezone,

    status: {
      short: fixture.fixture.status.short,
      long: fixture.fixture.status.long,
      elapsed: fixture.fixture.status.elapsed,
    },

    league: {
      id: fixture.league.id,
      name: fixture.league.name,
      country: fixture.league.country,
      logo: fixture.league.logo,
      flag: fixture.league.flag,
      season: fixture.league.season,
      round: fixture.league.round,
    },

    home: {
      id: fixture.teams.home.id,
      name: fixture.teams.home.name,
      logo: fixture.teams.home.logo,
      winner: fixture.teams.home.winner,
    },

    away: {
      id: fixture.teams.away.id,
      name: fixture.teams.away.name,
      logo: fixture.teams.away.logo,
      winner: fixture.teams.away.winner,
    },

    goals: {
      home: fixture.goals.home,
      away: fixture.goals.away,
    },

    score: fixture.score,

    venue: {
      name: fixture.fixture.venue?.name || "",
      city: fixture.fixture.venue?.city || "",
    },
  };
};