// controllers/playerController.js

const {
  footballDataGet,
} = require("../services/footballDataApi");

/* =====================================================
CONFIGURATION
===================================================== */

const DEFAULT_SEASON = 2025;

const EPL_CONFIG = {
  code: "PL",
  id: 2021,
  name: "Premier League",
  country: "England",
  logo:
    "https://crests.football-data.org/PL.png",
};

/* =====================================================
SEASON RESOLVER
===================================================== */

function resolveSeason(value) {
  const season = parseInt(value, 10);

  if (
    !Number.isNaN(season) &&
    season >= 2000 &&
    season <= 2100
  ) {
    return season;
  }

  return DEFAULT_SEASON;
}

/* =====================================================
SAFE NUMBER
===================================================== */

function num(value) {
  const n = Number(value);

  return Number.isFinite(n) ? n : 0;
}

/* =====================================================
GET PLAYER PROFILE

Loads both:

1. /persons/:id
2. /competitions/PL/scorers

The second request is important because it gives
us the current Premier League team and scorer data.
===================================================== */

async function loadPlayerProfile(
  playerId,
  season
) {
  let profile = null;
  let scorer = null;

  /* =================================================
     PERSON PROFILE
  ================================================= */

  try {
    console.log(
      `🌍 Loading football-data.org person ${playerId}`
    );

    profile =
      await footballDataGet(
        `/persons/${playerId}`
      );

    if (profile) {
      console.log(
        `✅ Person ${playerId} loaded`
      );
    }
  } catch (error) {
    console.warn(
      `⚠️ Person lookup failed for ${playerId}:`,
      error.response?.status ||
        error.message
    );
  }

  /* =================================================
     PREMIER LEAGUE SCORER DATA

     This gives:
     - team
     - team crest
     - goals
     - assists
     - played matches
  ================================================= */

  try {
    console.log(
      `🔄 Loading Premier League scorer data for player ${playerId}`
    );

    const scorerResponse =
      await footballDataGet(
        "/competitions/PL/scorers",
        {
          season,
          limit: 100,
        }
      );

    const scorers =
      Array.isArray(
        scorerResponse?.scorers
      )
        ? scorerResponse.scorers
        : [];

    scorer =
      scorers.find(
        (item) =>
          num(
            item?.player?.id
          ) === num(playerId)
      ) || null;

    if (scorer) {
      console.log(
        `✅ Scorer data found for ${playerId}: ${
          scorer.team?.name ||
          "Unknown Team"
        }`
      );
    } else {
      console.warn(
        `⚠️ No scorer data found for player ${playerId}`
      );
    }
  } catch (error) {
    console.warn(
      "⚠️ Premier League scorer lookup failed:",
      error.response?.data ||
        error.message
    );
  }

  /* =================================================
     FALLBACK

     If direct person endpoint failed but scorer
     exists, use scorer.player as the profile.
  ================================================= */

  if (!profile && scorer?.player) {
    profile =
      scorer.player;
  }

  return {
    profile,
    scorer,
  };
}

/* =====================================================
GET PLAYER MATCHES

Used by fixtures/history/performance.

Profile loading does NOT depend on this request.
===================================================== */

async function getPlayerMatches(
  playerId,
  season
) {
  try {
    console.log(
      `🌍 Loading player matches ${playerId}`
    );

    const data =
      await footballDataGet(
        `/persons/${playerId}/matches`,
        {
          dateFrom:
            `${season}-07-01`,

          dateTo:
            `${season + 1}-06-30`,

          competitions:
            "PL",

          limit: 100,
        }
      );

    return data || {};
  } catch (error) {
    console.warn(
      `⚠️ Player matches unavailable for ${playerId}:`,
      error.response?.status ||
        error.message
    );

    return {};
  }
}

/* =====================================================
BUILD PLAYER

This object is deliberately shaped around your
existing frontend components.

PlayerHeader expects:

player.photo
player.name
player.position
player.team.name
player.number

PlayerSidebar expects:

player.team.logo
===================================================== */

function buildPlayer(
  profile,
  scorer,
  season
) {
  const team =
    scorer?.team ||
    profile?.currentTeam ||
    {};

  const teamData = {
    id:
      team?.id ?? null,

    name:
      team?.name ||
      team?.shortName ||
      "Unknown Team",

    logo:
      team?.crest ||
      null,
  };

  const playerData =
    profile || {};

  const goals =
    scorer?.goals ?? 0;

  const assists =
    scorer?.assists ?? 0;

  const appearances =
    scorer?.playedMatches ?? 0;

  return {
    /* =================================================
       BASIC IDENTITY
    ================================================= */

    id:
      playerData?.id ??
      null,

    name:
      playerData?.name ||
      "Unknown Player",

    firstname:
      playerData?.firstName ||
      null,

    lastname:
      playerData?.lastName ||
      null,

    age:
      calculateAge(
        playerData?.dateOfBirth
      ),

    nationality:
      playerData?.nationality ||
      null,

    height:
      playerData?.height ||
      null,

    weight:
      playerData?.weight ||
      null,

    injured:
      false,

    photo:
      playerData?.photo ||
      null,

    position:
      playerData?.position ||
      "Football Player",

    number:
      playerData?.shirtNumber ??
      null,

    /* =================================================
       CURRENT TEAM
    ================================================= */

    team:
      teamData,

    club:
      teamData,

    /* =================================================
       BIRTH
    ================================================= */

    birth: {
      date:
        playerData?.dateOfBirth ||
        null,

      place:
        playerData?.placeOfBirth ||
        null,

      country:
        playerData?.countryOfBirth ||
        playerData?.nationality ||
        null,
    },

    /* =================================================
       STATISTICS
    ================================================= */

    statistics: [
      {
        league: {
          id:
            EPL_CONFIG.id,

          name:
            EPL_CONFIG.name,

          country:
            EPL_CONFIG.country,

          logo:
            EPL_CONFIG.logo,

          season,
        },

        team:
          teamData,

        games: {
          appearances:
            num(appearances),

          lineups:
            0,

          minutes:
            0,

          number:
            playerData?.shirtNumber ??
            null,

          position:
            playerData?.position ||
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
          total: 0,
          on: 0,
        },

        goals: {
          total:
            num(goals),

          conceded: 0,

          assists:
            num(assists),

          saves: 0,
        },

        passes: {
          total: 0,
          key: 0,
          accuracy: "",
        },

        tackles: {
          total: 0,
          blocks: 0,
          interceptions: 0,
        },

        duels: {
          total: 0,
          won: 0,
        },

        dribbles: {
          attempts: 0,
          success: 0,
          past: 0,
        },

        fouls: {
          drawn: 0,
          committed: 0,
        },

        cards: {
          yellow: 0,
          yellowred: 0,
          red: 0,
        },

        penalty: {
          won: 0,
          committed: 0,
          scored: 0,
          missed: 0,
          saved: 0,
        },
      },
    ],

    /* =================================================
       CAREER / PERFORMANCE
    ================================================= */

    career: [],

    performance: [],

    /* =================================================
       HISTORY / FIXTURES
    ================================================= */

    history: [],

    fixtures: [],

    /* =================================================
       UNAVAILABLE DATA

       football-data.org does not provide equivalent
       API-Football transfer/trophy endpoints.
    ================================================= */

    transfers: [],

    trophies: [],
  };
}

/* =====================================================
CALCULATE AGE
===================================================== */

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) {
    return null;
  }

  const birth =
    new Date(dateOfBirth);

  if (
    Number.isNaN(
      birth.getTime()
    )
  ) {
    return null;
  }

  const today =
    new Date();

  let age =
    today.getFullYear() -
    birth.getFullYear();

  const month =
    today.getMonth() -
    birth.getMonth();

  if (
    month < 0 ||
    (
      month === 0 &&
      today.getDate() <
        birth.getDate()
    )
  ) {
    age--;
  }

  return age;
}

/* =====================================================
PLAYER PROFILE

GET /api/player/:id
===================================================== */

exports.getPlayer =
  async (
    req,
    res
  ) => {
    try {
      const playerId =
        parseInt(
          req.params.id,
          10
        );

      const season =
        resolveSeason(
          req.query.season
        );

      if (
        Number.isNaN(playerId)
      ) {
        return res.status(400).json({
          success: false,
          player: null,
          message:
            "Invalid player identifier",
        });
      }

      console.log(
        "======================================"
      );

      console.log(
        `⚽ PLAYER PROFILE ${playerId}`
      );

      console.log(
        `📅 Season ${season}`
      );

      const {
        profile,
        scorer,
      } =
        await loadPlayerProfile(
          playerId,
          season
        );

      if (!profile) {
        return res.json({
          success: false,
          player: null,
          message:
            "Player not found",
        });
      }

      const player =
        buildPlayer(
          profile,
          scorer,
          season
        );

      console.log(
        `✅ Player loaded: ${player.name}`
      );

      console.log(
        `🏟️ Club: ${player.team?.name || "Unknown"}`
      );

      console.log(
        `⚽ Goals: ${
          player.statistics?.[0]?.goals?.total ||
          0
        }`
      );

      console.log(
        "======================================"
      );

      return res.json({
        success: true,

        season,

        player,

        source:
          "football-data.org",

        message:
          "Player loaded",
      });
    } catch (error) {
      console.error(
        "🔥 PLAYER PROFILE ERROR:",
        error.message
      );

      console.error(
        "Response:",
        error.response?.data
      );

      return res.status(500).json({
        success: false,
        player: null,
        message:
          "Unable to load player",
        error:
          error.message,
      });
    }
  };

/* =====================================================
PLAYER STATISTICS

GET /api/player/:id/statistics
===================================================== */

exports.getStatistics =
  async (
    req,
    res
  ) => {
    try {
      const playerId =
        parseInt(
          req.params.id,
          10
        );

      const season =
        resolveSeason(
          req.query.season
        );

      const {
        profile,
        scorer,
      } =
        await loadPlayerProfile(
          playerId,
          season
        );

      if (!profile) {
        return res.json({
          success: false,
          statistics: [],
          message:
            "Player not found",
        });
      }

      const player =
        buildPlayer(
          profile,
          scorer,
          season
        );

      return res.json({
        success: true,
        season,
        statistics:
          player.statistics,
        message:
          "Player statistics loaded",
      });
    } catch (error) {
      console.error(
        "❌ PlayerStatistics:",
        error.message
      );

      return res.status(500).json({
        success: false,
        statistics: [],
        message:
          "Unable to load player statistics",
      });
    }
  };

/* =====================================================
PLAYER CAREER
===================================================== */

exports.getCareer =
  async (
    req,
    res
  ) => {
    try {
      const playerId =
        parseInt(
          req.params.id,
          10
        );

      const season =
        resolveSeason(
          req.query.season
        );

      const {
        profile,
        scorer,
      } =
        await loadPlayerProfile(
          playerId,
          season
        );

      if (!profile) {
        return res.json({
          success: false,
          career: [],
          message:
            "Player not found",
        });
      }

      const player =
        buildPlayer(
          profile,
          scorer,
          season
        );

      return res.json({
        success: true,
        season,
        career:
          player.statistics,
        message:
          "Career loaded",
      });
    } catch (error) {
      console.error(
        "❌ PlayerCareer:",
        error.message
      );

      return res.status(500).json({
        success: false,
        career: [],
        message:
          "Unable to load career",
      });
    }
  };

/* =====================================================
PLAYER PERFORMANCE
===================================================== */

exports.getPerformance =
  async (
    req,
    res
  ) => {
    try {
      const playerId =
        parseInt(
          req.params.id,
          10
        );

      const season =
        resolveSeason(
          req.query.season
        );

      const {
        profile,
        scorer,
      } =
        await loadPlayerProfile(
          playerId,
          season
        );

      if (!profile) {
        return res.json({
          success: false,
          performance: [],
          message:
            "Player not found",
        });
      }

      const player =
        buildPlayer(
          profile,
          scorer,
          season
        );

      return res.json({
        success: true,
        season,
        performance:
          player.statistics,
      });
    } catch (error) {
      console.error(
        "❌ PlayerPerformance:",
        error.message
      );

      return res.status(500).json({
        success: false,
        performance: [],
        message:
          "Unable to load player performance",
      });
    }
  };

/* =====================================================
PLAYER FIXTURES
===================================================== */

exports.getFixtures =
  async (
    req,
    res
  ) => {
    try {
      const playerId =
        parseInt(
          req.params.id,
          10
        );

      const season =
        resolveSeason(
          req.query.season
        );

      const data =
        await getPlayerMatches(
          playerId,
          season
        );

      const fixtures =
        Array.isArray(
          data?.matches
        )
          ? data.matches
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
        error.message
      );

      return res.status(500).json({
        success: false,
        fixtures: [],
        message:
          "Unable to load player fixtures",
      });
    }
  };

/* =====================================================
PLAYER HISTORY
===================================================== */

exports.getHistory =
  async (
    req,
    res
  ) => {
    try {
      const playerId =
        parseInt(
          req.params.id,
          10
        );

      const season =
        resolveSeason(
          req.query.season
        );

      const data =
        await getPlayerMatches(
          playerId,
          season
        );

      const history =
        Array.isArray(
          data?.matches
        )
          ? data.matches
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
        error.message
      );

      return res.status(500).json({
        success: false,
        history: [],
        message:
          "Unable to load player history",
      });
    }
  };

/* =====================================================
PLAYER TRANSFERS

Not provided by football-data.org.
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
      available: false,
      source:
        "football-data.org",
      message:
        "Player transfers are not available from football-data.org",
    });
  };

/* =====================================================
PLAYER TROPHIES

Not provided by football-data.org.
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
      available: false,
      source:
        "football-data.org",
      message:
        "Player trophies are not available from football-data.org",
    });
  };

/* =====================================================
PLAYER SEARCH

No direct player-name search endpoint.
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
      available: false,
      source:
        "football-data.org",
      message:
        "Player search is not directly available from football-data.org",
    });
  };