const {
  getCompetitionScorers,
} = require("../services/footballDataApi");

/* =====================================================
LEAGUE / COMPETITION MAP

Supports:

?league=39
?league=epl
?league=PL

Old API-Football IDs are kept for compatibility.
===================================================== */

const LEAGUE_MAP = {
  epl: "PL",
  premierleague: "PL",
  "premier-league": "PL",

  laliga: "PD",
  "la-liga": "PD",

  bundesliga: "BL1",

  seriea: "SA",
  "serie-a": "SA",

  ligue1: "FL1",
  "ligue-1": "FL1",

  primeiraliga: "PPL",
  "primeira-liga": "PPL",

  /* Old API-Football IDs */

  39: "PL",
  140: "PD",
  78: "BL1",
  135: "SA",
  61: "FL1",
};

/* =====================================================
RESOLVE LEAGUE
===================================================== */

function resolveCompetition(value) {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return "PL";
  }

  const key = String(value)
    .trim()
    .toLowerCase();

  if (LEAGUE_MAP[key]) {
    return LEAGUE_MAP[key];
  }

  /* Allow direct football-data.org codes */

  if (
    /^[a-z]{2,4}$/i.test(key)
  ) {
    return key.toUpperCase();
  }

  return null;
}

/* =====================================================
GET SEASON
===================================================== */

function getSeason(value) {
  if (
    value !== undefined &&
    value !== null &&
    String(value).trim() !== ""
  ) {
    const season = Number(value);

    if (
      Number.isInteger(season) &&
      season >= 1900 &&
      season <= 2100
    ) {
      return season;
    }
  }

  return 2025;
}

/* =====================================================
FORMAT MINI SCORER
===================================================== */

function formatMiniScorer(
  scorer
) {
  if (!scorer) {
    return null;
  }

  const player =
    scorer.player || {};

  const team =
    scorer.team || {};

  const goals =
    Number(scorer.goals) || 0;

  const assists =
    Number(scorer.assists) || 0;

  const penalties =
    Number(scorer.penalties) || 0;

  return {
    /* ===============================================
       PLAYER
    =============================================== */

    player: {
      id:
        player.id ?? null,

      name:
        player.name ||
        "Unknown Player",

      firstname:
        player.firstName ||
        null,

      lastname:
        player.lastName ||
        null,

      firstName:
        player.firstName ||
        null,

      lastName:
        player.lastName ||
        null,

      age:
        calculateAge(
          player.dateOfBirth
        ),

      dateOfBirth:
        player.dateOfBirth ||
        null,

      nationality:
        player.nationality ||
        null,

      position:
        player.position ||
        null,

      number:
        player.shirtNumber ??
        null,

      /*
       * football-data.org does not provide the
       * old API-Football player photo URL.
       */
      photo: null,
    },

    /* ===============================================
       COMPATIBILITY STATISTICS
    =============================================== */

    statistics: [
      {
        team: {
          id:
            team.id ?? null,

          name:
            team.name ||
            "Unknown Team",

          logo:
            team.crest ||
            null,

          crest:
            team.crest ||
            null,
        },

        league: {
          id: null,

          name: null,

          code: null,

          logo: null,
        },

        games: {
          appearences: 0,

          appearances: 0,

          lineups: 0,

          minutes: 0,

          number:
            player.shirtNumber ??
            null,

          position:
            player.position ||
            null,

          rating: "",
        },

        goals: {
          total: goals,

          assists,

          conceded: 0,

          saves: 0,
        },

        penalty: {
          scored: penalties,

          missed: 0,

          won: 0,

          committed: 0,

          commited: 0,
        },
      },
    ],

    /* ===============================================
       DIRECT TEAM DATA
    =============================================== */

    team: {
      id:
        team.id ?? null,

      name:
        team.name ||
        "Unknown Team",

      shortName:
        team.shortName ||
        null,

      tla:
        team.tla ||
        null,

      logo:
        team.crest ||
        null,

      crest:
        team.crest ||
        null,
    },

    /* ===============================================
       DIRECT LEAGUE DATA
    =============================================== */

    league: {
      id: null,

      name: null,

      code: null,

      logo: null,
    },

    /* ===============================================
       MINI VALUES
    =============================================== */

    goals,

    assists,

    appearances: 0,
  };
}

/* =====================================================
CALCULATE AGE
===================================================== */

function calculateAge(
  dateOfBirth
) {
  if (!dateOfBirth) {
    return null;
  }

  const birthDate =
    new Date(
      dateOfBirth
    );

  if (
    Number.isNaN(
      birthDate.getTime()
    )
  ) {
    return null;
  }

  const today =
    new Date();

  let age =
    today.getFullYear() -
    birthDate.getFullYear();

  const monthDifference =
    today.getMonth() -
    birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      today.getDate() <
        birthDate.getDate()
    )
  ) {
    age--;
  }

  return age;
}

/* =====================================================
GET TOP SCORERS MINI
===================================================== */

exports.getTopScorersMini =
  async (
    req,
    res
  ) => {
    try {
      /* =============================================
         RESOLVE LEAGUE
      ============================================= */

      const competition =
        resolveCompetition(
          req.query.league
        );

      const season =
        getSeason(
          req.query.season
        );

      if (!competition) {
        return res.status(
          400
        ).json({
          success: false,

          season,

          league: null,

          count: 0,

          players: [],

          message:
            "Invalid league identifier",
        });
      }

      console.log(
        "======================================"
      );

      console.log(
        "🏆 TOP SCORERS MINI"
      );

      console.log(
        "Competition:",
        competition
      );

      console.log(
        "Season:",
        season
      );

      console.log(
        "======================================"
      );

      /* =============================================
         FOOTBALL-DATA.ORG
      ============================================= */

      const response =
        await getCompetitionScorers(
          competition,
          {
            season,

            limit: 10,
          }
        );

      /* =============================================
         FORMAT FIRST 10
      ============================================= */

      const players =
        Array.isArray(
          response
        )
          ? response
              .slice(0, 10)
              .map(
                formatMiniScorer
              )
              .filter(Boolean)
          : [];

      /* =============================================
         EMPTY
      ============================================= */

      if (
        players.length === 0
      ) {
        return res.json({
          success: true,

          season,

          league:
            competition,

          count: 0,

          players: [],

          message:
            "No top scorers found",
        });
      }

      /* =============================================
         RESPONSE
      ============================================= */

      return res.json({
        success: true,

        season,

        league:
          competition,

        count:
          players.length,

        players,
      });
    } catch (err) {
      console.error(
        "❌ TopScorersMiniController:",
        err.response?.data ||
          err.message
      );

      if (
        err.response?.status ===
        429
      ) {
        return res.status(
          503
        ).json({
          success: false,

          season:
            getSeason(
              req.query.season
            ),

          league:
            resolveCompetition(
              req.query.league
            ),

          count: 0,

          players: [],

          apiLimitReached:
            true,

          message:
            "Football-data.org request limit reached. Please try again later.",
        });
      }

      return res.status(
        500
      ).json({
        success: false,

        season:
          getSeason(
            req.query.season
          ),

        league:
          resolveCompetition(
            req.query.league
          ),

        count: 0,

        players: [],

        message:
          "Unable to load top scorers",
      });
    }
  };