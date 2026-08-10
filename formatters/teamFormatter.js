module.exports = function formatTeam(data) {
  const teamInfo = data.team?.[0] || data.team || {};

  const team = teamInfo.team || {};
  const venue = teamInfo.venue || {};

  const stats = data.statistics || {};

  const coach =
    Array.isArray(data.coach) && data.coach.length
      ? data.coach[0]
      : null;

  const players = Array.isArray(data.players)
    ? data.players
    : [];

  const fixtures = Array.isArray(data.fixtures)
    ? data.fixtures
    : [];

  const transfers = Array.isArray(data.transfers)
    ? data.transfers
    : [];

  const injuries = Array.isArray(data.injuries)
    ? data.injuries
    : [];

  const trophies = Array.isArray(data.trophies)
    ? data.trophies
    : [];

  const statistics = {
    played:
      stats.fixtures?.played?.total || 0,

    wins:
      stats.fixtures?.wins?.total || 0,

    draws:
      stats.fixtures?.draws?.total || 0,

    losses:
      stats.fixtures?.loses?.total || 0,

    goalsFor:
      stats.goals?.for?.total?.total || 0,

    goalsAgainst:
      stats.goals?.against?.total?.total || 0,

    cleanSheets:
      stats.clean_sheet?.total || 0,

    failedToScore:
      stats.failed_to_score?.total || 0,

    points:
      (stats.fixtures?.wins?.total || 0) * 3 +
      (stats.fixtures?.draws?.total || 0),

    form:
      stats.form || "",

    biggestWin:
      stats.biggest?.wins || null,

    biggestLoss:
      stats.biggest?.loses || null,

    home: {
      played:
        stats.fixtures?.played?.home || 0,

      wins:
        stats.fixtures?.wins?.home || 0,

      draws:
        stats.fixtures?.draws?.home || 0,

      losses:
        stats.fixtures?.loses?.home || 0,
    },

    away: {
      played:
        stats.fixtures?.played?.away || 0,

      wins:
        stats.fixtures?.wins?.away || 0,

      draws:
        stats.fixtures?.draws?.away || 0,

      losses:
        stats.fixtures?.loses?.away || 0,
    },

    goals: stats.goals || {},

    cards: stats.cards || {},

    lineups: stats.lineups || [],
  };

  const formattedPlayers = players.map((item) => {
    const player = item.player || item;

    const stat = item.statistics?.[0] || {};

    return {
      id: player.id,

      name: player.name,

      firstname: player.firstname,

      lastname: player.lastname,

      age: player.age,

      birth: player.birth,

      nationality: player.nationality,

      photo: player.photo,

      height: player.height,

      weight: player.weight,

      injured: player.injured,

      position: stat.games?.position || "",

      number: stat.games?.number || null,

      captain: stat.games?.captain || false,

      appearances:
        stat.games?.appearences || 0,

      minutes:
        stat.games?.minutes || 0,

      rating:
        stat.games?.rating || null,

      goals:
        stat.goals?.total || 0,

      assists:
        stat.goals?.assists || 0,

      yellow:
        stat.cards?.yellow || 0,

      red:
        stat.cards?.red || 0,
    };
  });

  const upcomingFixtures = fixtures.filter(
    (f) =>
      f.fixture?.status?.short !== "FT"
  );

  const latestResults = fixtures.filter(
    (f) =>
      f.fixture?.status?.short === "FT"
  );
  return {
    id: team.id,

    name: team.name,

    code: team.code,

    country: team.country,

    founded: team.founded,

    national: team.national,

    logo: team.logo,

    venue: {
      id: venue.id,

      name: venue.name,

      address: venue.address,

      city: venue.city,

      capacity: venue.capacity,

      surface: venue.surface,

      image: venue.image,
    },

    /* =========================
       COACH
    ========================= */

    coach,

    /* =========================
       STATISTICS
    ========================= */

    statistics,

    /* =========================
       PLAYERS
    ========================= */

    players: formattedPlayers,

    /* =========================
       FIXTURES
    ========================= */

    fixtures: upcomingFixtures,

    latestResults,

    /* =========================
       HISTORY
    ========================= */

    history: latestResults,

    /* =========================
       TRANSFERS
    ========================= */

    transfers,

    /* =========================
       INJURIES
    ========================= */

    injuries,

    /* =========================
       TROPHIES
    ========================= */

    trophies,

    achievements: trophies,

    /* =========================
       SOCIAL (placeholder)
    ========================= */

    social: {
      website: team.website || "",

      facebook: "",

      instagram: "",

      twitter: "",

      youtube: "",
    },
  };
};