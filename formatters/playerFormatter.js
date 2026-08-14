const {
  footballDataGet,
} = require("../services/footballDataApi");

const formatPlayer = require("../formatters/playerFormatter");

/* =====================================================
CONFIG
===================================================== */

const LEAGUE_CONFIG = {
  epl: {
    code: "PL",
    name: "Premier League",
  },
};

/* =====================================================
SEASON RESOLVER

football-data.org uses the starting year.

2024 = 2024/25
2025 = 2025/26
2026 = 2026/27
===================================================== */

function resolveSeason(requestedSeason) {
  const season = parseInt(
    requestedSeason,
    10
  );

  if (
    !Number.isNaN(season) &&
    season >= 2000 &&
    season <= 2100
  ) {
    return season;
  }

  return 2025;
}

/* =====================================================
SEASON DATE RANGE

Used for /persons/:id/matches because the player
matches endpoint is date-based rather than using
the same season parameter as competition endpoints.
===================================================== */

function getSeasonDates(season) {
  return {
    dateFrom: `${season}-07-01`,
    dateTo: `${season + 1}-06-30`,
  };
}

/* =====================================================
NORMALIZE PLAYER

football-data.org:

firstName
lastName
dateOfBirth
nationality
position
currentTeam

Our formatter expects:

firstname
lastname
birth
team-like data inside statistics
===================================================== */

function normalizePlayer(profile) {
  if (!profile) {
    return {
      id: null,
      name: "Unknown Player",
      firstname: null,
      lastname: null,
      age: null,
      nationality: null,
      height: null,
      weight: null,
      injured: false,
      photo: null,

      birth: {
        date: null,
        place: null,
        country: null,
      },
    };
  }

  return {
    id:
      profile.id ?? null,

    name:
      profile.name ||
      "Unknown Player",

    firstname:
      profile.firstName ||
      null,

    lastname:
      profile.lastName ||
      null,

    age: null,

    nationality:
      profile.nationality ||
      null,

    height: null,

    weight: null,

    injured: false,

    photo: null,

    birth: {
      date:
        profile.dateOfBirth ||
        null,

      place:
        profile.placeOfBirth ||
        null,

      country:
        profile.countryOfBirth ||
        null,
    },

    currentTeam:
      profile.currentTeam ||
      null,
  };
}

/* =====================================================
BUILD STATISTICS

football-data.org /persons/:id/matches returns
aggregated values such as:

matchesOnPitch
startingXI
minutesPlayed
goals
assists
cards
etc.

We convert those values into the shape your existing
playerFormatter expects.
===================================================== */

function buildPlayerStatistics(
  profile,
  matchData,
  season,
  competitionCode = "PL"
) {
  const aggregation =
    matchData?.aggregations || {};

  const team =
    profile?.currentTeam || {};

  const competition =
    {
      id: 2021,

      name:
        "Premier League",

      country:
        "England",

      logo:
        "https://crests.football-data.org/PL.png",

      season,
    };

  return [
    {
      league: competition,

      team: {
        id:
          team.id ?? null,

        name:
          team.name ||
          team.shortName ||
          "Unknown Team",

        logo:
          team.crest ||
          null,
      },

      games: {
        appearances:
          aggregation.matchesOnPitch ??
          0,

        lineups:
          aggregation.startingXI ??
          0,

        minutes:
          aggregation.minutesPlayed ??
          0,

        number:
          profile?.shirtNumber ??
          null,

        position:
          profile?.position ||
          "",

        rating:
          "",
      },

      substitutes: {
        in: 0,
        out: 0,
        bench: 0,
      },

      shots: {
        total:
          aggregation.shots ??
          0,

        on:
          aggregation.shotsOnTarget ??
          0,
      },

      goals: {
        total:
          aggregation.goals ??
          0,

        conceded:
          aggregation.concededGoals ??
          0,

        assists:
          aggregation.assists ??
          0,

        saves:
          aggregation.saves ??
          0,
      },

      passes: {
        total:
          aggregation.passes ??
          0,

        key:
          aggregation.keyPasses ??
          0,

        accuracy:
          aggregation.passAccuracy ??
          "",
      },

      tackles: {
        total:
          aggregation.tackles ??
          0,

        blocks:
          aggregation.blocks ??
          0,

        interceptions:
          aggregation.interceptions ??
          0,
      },

      duels: {
        total:
          aggregation.duels ??
          0,

        won:
          aggregation.duelsWon ??
          0,
      },

      dribbles: {
        attempts:
          aggregation.dribbles ??
          0,

        success:
          aggregation.dribblesWon ??
          0,

        past:
          aggregation.dribblesPast ??
          0,
      },

      fouls: {
        drawn:
          aggregation.foulsDrawn ??
          0,

        committed:
          aggregation.foulsCommitted ??
          0,
      },

      cards: {
        yellow:
          aggregation.yellowCards ??
          0,

        yellowred:
          aggregation.yellowRedCards ??
          0,

        red:
          aggregation.redCards ??
          0,
      },

      penalty: {
        won:
          aggregation.penaltiesWon ??
          0,

        committed:
          aggregation.penaltiesCommitted ??
          0,

        scored:
          aggregation.penalties ??
          0,

        missed:
          aggregation.penaltiesMissed ??
          0,

        saved:
          aggregation.penaltiesSaved ??
          0,
      },
    },
  ];
}

/* =====================================================
BUILD FORMATTER INPUT

This creates the API-Football-like intermediate
structure required by playerFormatter.js.
===================================================== */

function buildFormatterInput(
  profile,
  matchData,
  season,
  transfers = [],
  trophies = []
) {
  const normalizedPlayer =
    normalizePlayer(profile);

  const statistics =
    buildPlayerStatistics(
      profile,
      matchData,
      season
    );

  return {
    player: {
      player:
        normalizedPlayer,

      statistics,
    },

    transfers,

    trophies,
  };
}

/* =====================================================
GET PERSON MATCHES

Used for:

statistics
career
performance
fixtures
history
===================================================== */

async function getPersonMatches(
  playerId,
  season
) {
  const {
    dateFrom,
    dateTo,
  } =
    getSeasonDates(
      season
    );

  console.log(
    `🌍 Football-data.org player matches: /persons/${playerId}/matches`
  );

  console.log(
    "Football-data.org player match params:",
    {
      dateFrom,
      dateTo,
      competitions: "PL",
      limit: 100,
    }
  );

  return await footballDataGet(
    `/persons/${playerId}/matches`,
    {
      dateFrom,
      dateTo,
      competitions: "PL",
      limit: 100,
    }
  );
}

/* =====================================================
PLAYER PROFILE

GET:

/api/player/:id

SOURCE:

football-data.org /persons/:id

Transfers and trophies are not supplied by
football-data.org, so they remain empty arrays.
===================================================== */

exports.getPlayer = async (
  req,
  res
) => {
  try {
    const playerId =
      req.params.id;

    const season =
      resolveSeason(
        req.query.season
      );

    console.log(
      `⚽ Loading player ${playerId} from football-data.org | Season ${season}`
    );

    /* -------------------------------------------------
    PLAYER PROFILE
    ------------------------------------------------- */

    const profile =
      await footballDataGet(
        `/persons/${playerId}`
      );

    if (!profile) {
      return res.json({
        success: false,
        player: null,
        message:
          "Player not found",
      });
    }

    /* -------------------------------------------------
    PLAYER MATCHES / AGGREGATIONS
    ------------------------------------------------- */

    let matchData = {};

    try {
      matchData =
        await getPersonMatches(
          playerId,
          season
        );
    } catch (error) {
      console.error(
        "Player matches:",
        error.response?.data ||
          error.message
      );
    }

    /* -------------------------------------------------
    FORMAT
    ------------------------------------------------- */

    const player =
      formatPlayer(
        buildFormatterInput(
          profile,
          matchData,
          season,
          [],
          []
        )
      );

    return res.json({
      success: true,

      season,

      player,

      message:
        "Player loaded",
    });
  } catch (error) {
    console.error(
      "❌ PlayerController:",
      error.response?.data ||
        error.message
    );

    return res.status(
      error.response?.status >= 400 &&
      error.response?.status < 600
        ? error.response.status
        : 500
    ).json({
      success: false,

      player: null,

      message:
        "Unable to load player",

      error:
        error.response?.data ||
        error.message,
    });
  }
};

/* =====================================================
PLAYER STATISTICS

GET:

/api/player/:id/statistics
===================================================== */

exports.getStatistics =
  async (
    req,
    res
  ) => {
    try {
      const playerId =
        req.params.id;

      const season =
        resolveSeason(
          req.query.season
        );

      console.log(
        `📊 Loading player statistics | Player ${playerId} | Season ${season}`
      );

      const profile =
        await footballDataGet(
          `/persons/${playerId}`
        );

      if (!profile) {
        return res.json({
          success: false,
          season,
          statistics: [],
          message:
            "Player not found",
        });
      }

      const matchData =
        await getPersonMatches(
          playerId,
          season
        );

      const formatterInput =
        buildFormatterInput(
          profile,
          matchData,
          season
        );

      const formatted =
        formatPlayer(
          formatterInput
        );

      return res.json({
        success: true,

        season,

        statistics:
          formatted?.statistics ||
          [],

        message:
          "Player statistics loaded",
      });
    } catch (error) {
      console.error(
        "❌ PlayerStatistics:",
        error.response?.data ||
          error.message
      );

      return res.status(
        error.response?.status >= 400 &&
        error.response?.status < 600
          ? error.response.status
          : 500
      ).json({
        success: false,

        statistics: [],

        message:
          "Unable to load player statistics",
      });
    }
  };

/* =====================================================
PLAYER TRANSFERS

football-data.org does not provide an equivalent
to API-Football /transfers.

Return an explicit empty response instead of
calling the old API-Football endpoint.
===================================================== */

exports.getTransfers =
  async (
    req,
    res
  ) => {
    return res.json({
      success: true,

      count: 0,

      transfers: [],

      source:
        "football-data.org",

      available: false,

      message:
        "Player transfer history is not provided by football-data.org",
    });
  };

/* =====================================================
PLAYER TROPHIES

football-data.org does not provide an equivalent
to API-Football /trophies.
===================================================== */

exports.getTrophies =
  async (
    req,
    res
  ) => {
    return res.json({
      success: true,

      count: 0,

      trophies: [],

      source:
        "football-data.org",

      available: false,

      message:
        "Player trophy history is not provided by football-data.org",
    });
  };

/* =====================================================
PLAYER SEARCH

football-data.org does not expose a direct player-name
search endpoint.

We intentionally do not call the old API-Football
/players endpoint.
===================================================== */

exports.searchPlayers =
  async (
    req,
    res
  ) => {
    return res.json({
      success: true,

      count: 0,

      players: [],

      source:
        "football-data.org",

      available: false,

      message:
        "Player name search is not directly provided by football-data.org",
    });
  };

/* =====================================================
PLAYER CAREER

football-data.org player matches cover the player's
available matches. We expose those matches-derived
statistics as the career data available through this API.
===================================================== */

exports.getCareer =
  async (
    req,
    res
  ) => {
    try {
      const playerId =
        req.params.id;

      const season =
        resolveSeason(
          req.query.season
        );

      const profile =
        await footballDataGet(
          `/persons/${playerId}`
        );

      if (!profile) {
        return res.json({
          success: false,

          season,

          career: [],

          message:
            "Player not found",
        });
      }

      const matchData =
        await getPersonMatches(
          playerId,
          season
        );

      const formatted =
        formatPlayer(
          buildFormatterInput(
            profile,
            matchData,
            season
          )
        );

      return res.json({
        success: true,

        season,

        career:
          formatted?.career ||
          [],

        message:
          "Career loaded",
      });
    } catch (error) {
      console.error(
        "❌ PlayerCareer:",
        error.response?.data ||
          error.message
      );

      return res.status(
        error.response?.status >= 400 &&
        error.response?.status < 600
          ? error.response.status
          : 500
      ).json({
        success: false,

        career: [],

        message:
          "Unable to load career",
      });
    }
  };

/* =====================================================
PLAYER PERFORMANCE

Returns the available aggregated performance
data plus the player's matches.
===================================================== */

exports.getPerformance =
  async (
    req,
    res
  ) => {
    try {
      const playerId =
        req.params.id;

      const season =
        resolveSeason(
          req.query.season
        );

      const profile =
        await footballDataGet(
          `/persons/${playerId}`
        );

      if (!profile) {
        return res.json({
          success: false,

          season,

          performance: [],

          message:
            "Player not found",
        });
      }

      const matchData =
        await getPersonMatches(
          playerId,
          season
        );

      const formatted =
        formatPlayer(
          buildFormatterInput(
            profile,
            matchData,
            season
          )
        );

      return res.json({
        success: true,

        season,

        performance:
          formatted?.performance ||
          [],

        matches:
          Array.isArray(
            matchData?.matches
          )
            ? matchData.matches
            : [],
      });
    } catch (error) {
      console.error(
        "❌ PlayerPerformance:",
        error.response?.data ||
          error.message
      );

      return res.status(
        error.response?.status >= 400 &&
        error.response?.status < 600
          ? error.response.status
          : 500
      ).json({
        success: false,

        performance: [],

        matches: [],

        message:
          "Unable to load player performance",
      });
    }
  };

/* =====================================================
PLAYER FIXTURES

football-data.org:

/persons/:id/matches

We return the player's matches.
===================================================== */

exports.getFixtures =
  async (
    req,
    res
  ) => {
    try {
      const playerId =
        req.params.id;

      const season =
        resolveSeason(
          req.query.season
        );

      const matchData =
        await getPersonMatches(
          playerId,
          season
        );

      const fixtures =
        Array.isArray(
          matchData?.matches
        )
          ? matchData.matches
          : [];

      return res.json({
        success: true,

        season,

        count:
          fixtures.length,

        fixtures,

        message:
          "Player fixtures loaded",
      });
    } catch (error) {
      console.error(
        "❌ PlayerFixtures:",
        error.response?.data ||
          error.message
      );

      return res.status(
        error.response?.status >= 400 &&
        error.response?.status < 600
          ? error.response.status
          : 500
      ).json({
        success: false,

        fixtures: [],

        message:
          "Unable to load player fixtures",
      });
    }
  };

/* =====================================================
PLAYER HISTORY

Use the player's football-data.org match history.
===================================================== */

exports.getHistory =
  async (
    req,
    res
  ) => {
    try {
      const playerId =
        req.params.id;

      const season =
        resolveSeason(
          req.query.season
        );

      const matchData =
        await getPersonMatches(
          playerId,
          season
        );

      const history =
        Array.isArray(
          matchData?.matches
        )
          ? matchData.matches
          : [];

      return res.json({
        success: true,

        season,

        count:
          history.length,

        history,

        message:
          "Player history loaded",
      });
    } catch (error) {
      console.error(
        "❌ PlayerHistory:",
        error.response?.data ||
          error.message
      );

      return res.status(
        error.response?.status >= 400 &&
        error.response?.status < 600
          ? error.response.status
          : 500
      ).json({
        success: false,

        history: [],

        message:
          "Unable to load player history",
      });
    }
  };