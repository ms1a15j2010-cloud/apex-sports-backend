module.exports = function formatHeadToHead(fixture = {}) {
  return {
    fixture: {
      id: fixture.fixture?.id ?? null,
      date: fixture.fixture?.date ?? null,
      timestamp: fixture.fixture?.timestamp ?? null,

      status: {
        short: fixture.fixture?.status?.short ?? "",
        long: fixture.fixture?.status?.long ?? "",
        elapsed: fixture.fixture?.status?.elapsed ?? null,
      },
    },

    league: {
      id: fixture.league?.id ?? null,
      name: fixture.league?.name ?? "",
      country: fixture.league?.country ?? "",
      logo: fixture.league?.logo ?? null,
      season: fixture.league?.season ?? null,
      round: fixture.league?.round ?? "",
    },

    home: {
      id: fixture.teams?.home?.id ?? null,
      name: fixture.teams?.home?.name ?? "",
      logo: fixture.teams?.home?.logo ?? null,
      winner: fixture.teams?.home?.winner ?? null,
    },

    away: {
      id: fixture.teams?.away?.id ?? null,
      name: fixture.teams?.away?.name ?? "",
      logo: fixture.teams?.away?.logo ?? null,
      winner: fixture.teams?.away?.winner ?? null,
    },

    goals: {
      home: fixture.goals?.home ?? 0,
      away: fixture.goals?.away ?? 0,
    },

    score: fixture.score ?? {},
  };
};