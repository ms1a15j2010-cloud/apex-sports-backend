const {
  getCompetitionScorers,
} = require("../services/footballDataApi");

/* =====================================================
LEAGUE / COMPETITION MAP

Frontend examples:

/api/top-scorers/epl
/api/top-scorers/premierleague
/api/top-scorers/39

football-data.org uses competition codes.
===================================================== */

const LEAGUE_MAP = {
  /* Premier League */
  epl: "PL",
  premierleague: "PL",
  "premier-league": "PL",

  /* La Liga */
  laliga: "PD",
  "la-liga": "PD",
  primera: "PD",

  /* Bundesliga */
  bundesliga: "BL1",

  /* Serie A */
  seriea: "SA",
  "serie-a": "SA",

  /* Ligue 1 */
  ligue1: "FL1",
  "ligue-1": "FL1",

  /* Primeira Liga */
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
RESOLVE COMPETITION
===================================================== */

function resolveCompetition(
  value
) {
  if (!value) {
    return null;
  }

  const key =
    String(value)
      .trim()
      .toLowerCase();

  if (
    LEAGUE_MAP[key]
  ) {
    return LEAGUE_MAP[key];
  }

  /*
   * Accept direct football-data.org competition
   * codes such as PL, PD, BL1, SA, FL1.
   */
  if (
    /^[a-z]{2,4}$/i.test(
      key
    )
  ) {
    return key.toUpperCase();
  }

  return null;
}

/* =====================================================
GET SEASON
===================================================== */

function getSeason(
  value
) {
  if (
    value !== undefined &&
    value !== null &&
    String(value).trim() !== ""
  ) {
    const season =
      Number(value);

    if (
      Number.isInteger(
        season
      ) &&
      season >= 1900 &&
      season <= 2100
    ) {
      return season;
    }
  }

  /*
   * Current migrated Apex Sports default.
   */
  return new Date().getMonth() >= 6
    ? new Date().getFullYear()
    : new Date().getFullYear() - 1;
}

/* =====================================================
GET LIMIT
===================================================== */

function getLimit(
  value
) {
  let limit =
    Number(value);

  if (
    !Number.isFinite(
      limit
    )
  ) {
    limit = 20;
  }

  limit =
    Math.floor(
      limit
    );

  if (
    limit < 1
  ) {
    limit = 1;
  }

  if (
    limit > 100
  ) {
    limit = 100;
  }

  return limit;
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
FORMAT SCORER

Native football-data.org scorer structure:

{
  player,
  team,
  goals,
  assists,
  penalties
}

We also expose a compatibility structure for the
existing Apex Sports frontend.
===================================================== */

function formatScorer(
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
    Number(
      scorer.goals
    ) || 0;

  const assists =
    Number(
      scorer.assists
    ) || 0;

  const penalties =
    Number(
      scorer.penalties
    ) || 0;

  return {
    /* ===============================================
    PLAYER
    =============================================== */

    player: {
      id:
        player.id ??
        null,

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
       * API-Football media photo URL.
       */
      photo:
        null,
    },

    /* ===============================================
    COMPATIBILITY STATISTICS
    =============================================== */

    statistics: [
      {
        team: {
          id:
            team.id ??
            null,

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
          id:
            null,

          name:
            null,

          code:
            null,
        },

        games: {
          appearances: 0,

          /*
           * Old frontend spelling.
           */
          appearences: 0,

          lineups: 0,

          minutes: 0,

          number:
            player.shirtNumber ??
            null,

          position:
            player.position ||
            null,

          rating:
            "",
        },

        goals: {
          total:
            goals,

          assists:
            assists,

          conceded: 0,

          saves: 0,
        },

        passes: {
          total: null,

          key: null,

          accuracy:
            null,
        },

        shots: {
          total: null,

          on: null,
        },

        tackles: {
          total: null,

          blocks: null,

          interceptions:
            null,
        },

        duels: {
          total: null,

          won: null,
        },

        dribbles: {
          attempts: null,

          success: null,

          past: null,
        },

        fouls: {
          drawn: null,

          committed: null,
        },

        cards: {
          yellow: 0,

          yellowred: 0,

          red: 0,
        },

        penalty: {
          won: null,

          committed: null,

          commited: null,

          scored:
            penalties,

          missed: 0,

          saved: null,
        },
      },
    ],

    /* ===============================================
    NATIVE DATA
    =============================================== */

    scorer: {
      goals,

      assists,

      penalties,
    },

    team: {
      id:
        team.id ??
        null,

      name:
        team.name ||
        "Unknown Team",

      shortName:
        team.shortName ||
        null,

      tla:
        team.tla ||
        null,

      crest:
        team.crest ||
        null,

      logo:
        team.crest ||
        null,
    },
  };
}

/* =====================================================
GET TOP SCORERS
===================================================== */

exports.getTopScorers =
  async (
    req,
    res
  ) => {
    try {
      /* =============================================
      RESOLVE URL PARAMETER

      Route uses:

      /:league

      therefore we MUST use:

      req.params.league
      ============================================= */

      const competition =
        resolveCompetition(
          req.params.league
        );

      const season =
        getSeason(
          req.query.season
        );

      const limit =
        getLimit(
          req.query.limit
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
        "🏆 TOP SCORERS"
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
        "Limit:",
        limit
      );

      console.log(
        "======================================"
      );

      /* =============================================
      FOOTBALL-DATA.ORG
      ============================================= */

      const scorers =
        await getCompetitionScorers(
          competition,
          {
            season,

            limit,
          }
        );

      /* =============================================
      FORMAT
      ============================================= */

      const players =
        Array.isArray(
          scorers
        )
          ? scorers
              .map(
                formatScorer
              )
              .filter(Boolean)
          : [];

      console.log(
        `✅ Top scorers loaded: ${players.length}`
      );

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

        message:
          players.length > 0
            ? "Top scorers loaded"
            : "No top scorers found",
      });
    } catch (error) {
      console.error(
        "❌ TopScorersController:",
        error.response?.data ||
          error.message
      );

      const status =
        error.response?.status;

      if (
        status === 429
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
              req.params.league
            ),

          count: 0,

          players: [],

          apiLimitReached:
            true,

          message:
            "Football-data.org request limit reached. Please wait and try again.",
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
            req.params.league
          ),

        count: 0,

        players: [],

        message:
          "Unable to load top scorers",
      });
    }
  };