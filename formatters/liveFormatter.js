function formatLive(fixtures) {
  return fixtures.map((match) => ({
    id: match.fixture.id,

    date: match.fixture.date,

    timestamp: match.fixture.timestamp,

    status: {
      short: match.fixture.status.short,
      long: match.fixture.status.long,
      elapsed: match.fixture.status.elapsed,
    },

    venue: {
      name: match.fixture.venue?.name,
      city: match.fixture.venue?.city,
    },

    league: {
      id: match.league.id,
      name: match.league.name,
      country: match.league.country,
      logo: match.league.logo,
      round: match.league.round,
    },

    home: {
      id: match.teams.home.id,
      name: match.teams.home.name,
      logo: match.teams.home.logo,
      winner: match.teams.home.winner,
    },

    away: {
      id: match.teams.away.id,
      name: match.teams.away.name,
      logo: match.teams.away.logo,
      winner: match.teams.away.winner,
    },

    goals: {
      home: match.goals.home,
      away: match.goals.away,
    },
  }));
}

module.exports = formatLive;