module.exports = function formatResult(match) {
  return {
    fixture: {
      id: match.fixture.id,
      date: match.fixture.date,
      status: match.fixture.status.short,
    },

    league: {
      id: match.league.id,
      name: match.league.name,
      logo: match.league.logo,
    },

    home: {
      id: match.teams.home.id,
      name: match.teams.home.name,
      logo: match.teams.home.logo,
    },

    away: {
      id: match.teams.away.id,
      name: match.teams.away.name,
      logo: match.teams.away.logo,
    },

    goals: {
      home: match.goals.home,
      away: match.goals.away,
    },
  };
};