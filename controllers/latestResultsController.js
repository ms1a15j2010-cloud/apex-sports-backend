const {
  getFinishedMatches,
} = require("../services/footballDataApi");

/* =====================================================
LATEST RESULTS CONTROLLER

Provider:
football-data.org

Canonical endpoint:

GET /api/results

Examples:

/api/results
/api/results?league=PL
/api/results?league=PL&season=2025
/api/results?league=PL&season=2025&limit=10
===================================================== */

/* =====================================================
LEAGUE MAP
===================================================== */

const LEAGUE_MAP = {
  epl: "PL",
  pl: "PL",
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
};

/* =====================================================
RESOLVE LEAGUE
===================================================== */

function resolveLeague(value) {
  const key = String(value || "")
    .trim()
    .toLowerCase();

  return (
    LEAGUE_MAP[key] ||
    (/^[a-z]{2,4}$/i.test(key)
      ? key.toUpperCase()
      : null)
  );
}

/* =====================================================
RESOLVE SEASON
===================================================== */

function resolveSeason(value) {
  if (
    value !== undefined &&
    value !== null &&
    String(value).trim() !== ""
  ) {
    const season = Number(value);

    if (
      Number.isInteger(season) &&
      season >= 2000 &&
      season <= 2100
    ) {
      return season;
    }
  }

  return new Date().getMonth() >= 6
    ? new Date().getFullYear()
    : new Date().getFullYear() - 1;
}

/* =====================================================
FORMAT RESULT

Converts football-data.org structure into the
Apex Sports result structure already used by
ResultsClient and other match components.
===================================================== */

function formatResult(match) {
  if (!match) {
    return null;
  }

  const homeTeam =
    match.homeTeam || {};

  const awayTeam =
    match.awayTeam || {};

  const startYear =
    match.season?.startDate
      ? Number(
          String(
            match.season.startDate
          ).substring(0, 4)
        )
      : null;

  return {
    id:
      match.id ?? null,

    fixture: {
      id:
        match.id ?? null,

      date:
        match.utcDate || null,

      timestamp:
        match.utcDate
          ? Math.floor(
              new Date(
                match.utcDate
              ).getTime() / 1000
            )
          : null,

      venue: {
        name:
          match.venue ||
          "Venue TBD",

        city:
          match.city ||
          match.area?.name ||
          "City TBD",
      },
    },

    league: {
      id:
        match.competition?.id ??
        2021,

      name:
        match.competition?.name ||
        "Premier League",

      code:
        match.competition?.code ||
        "PL",

      country:
        match.area?.name ||
        "England",

      logo:
        match.competition?.emblem ||
        "https://crests.football-data.org/PL.png",

      flag:
        match.area?.flag ||
        null,

      season:
        startYear,
    },

    home: {
      id:
        homeTeam.id ?? null,

      name:
        homeTeam.name ||
        homeTeam.shortName ||
        "Home Team",

      shortName:
        homeTeam.shortName ||
        null,

      tla:
        homeTeam.tla ||
        null,

      logo:
        homeTeam.crest ||
        null,

      winner:
        match.score?.winner ===
        "HOME"
          ? true
          : match.score?.winner ===
            "AWAY"
          ? false
          : null,
    },

    away: {
      id:
        awayTeam.id ?? null,

      name:
        awayTeam.name ||
        awayTeam.shortName ||
        "Away Team",

      shortName:
        awayTeam.shortName ||
        null,

      tla:
        awayTeam.tla ||
        null,

      logo:
        awayTeam.crest ||
        null,

      winner:
        match.score?.winner ===
        "AWAY"
          ? true
          : match.score?.winner ===
            "HOME"
          ? false
          : null,
    },

    /* Compatibility structure */

    teams: {
      home: {
        id:
          homeTeam.id ?? null,

        name:
          homeTeam.name ||
          homeTeam.shortName ||
          "Home Team",

        logo:
          homeTeam.crest ||
          null,

        winner:
          match.score?.winner ===
          "HOME"
            ? true
            : match.score?.winner ===
              "AWAY"
            ? false
            : null,
      },

      away: {
        id:
          awayTeam.id ?? null,

        name:
          awayTeam.name ||
          awayTeam.shortName ||
          "Away Team",

        logo:
          awayTeam.crest ||
          null,

        winner:
          match.score?.winner ===
          "AWAY"
            ? true
            : match.score?.winner ===
              "HOME"
            ? false
            : null,
      },
    },

    /* Goals */

    goals: {
      home:
        match.score?.fullTime
          ?.home ?? null,

      away:
        match.score?.fullTime
          ?.away ?? null,
    },

    /* Full score object */

    score: {
      home:
        match.score?.fullTime
          ?.home ?? null,

      away:
        match.score?.fullTime
          ?.away ?? null,

      halftime: {
        home:
          match.score?.halfTime
            ?.home ?? null,

        away:
          match.score?.halfTime
            ?.away ?? null,
      },

      fulltime: {
        home:
          match.score?.fullTime
            ?.home ?? null,

        away:
          match.score?.fullTime
            ?.away ?? null,
      },
    },

    status: {
      short: "FT",

      long:
        match.status ||
        "FINISHED",
    },

    rawStatus:
      match.status ||
      "FINISHED",
  };
}

/* =====================================================
GET LATEST RESULTS
===================================================== */

exports.getLatestResults =
  async (req, res) => {
    try {
      const league =
        resolveLeague(
          req.query.league || "PL"
        );

      const season =
        resolveSeason(
          req.query.season
        );

      let limit =
        Number(
          req.query.limit
        ) || 10;

      if (
        !Number.isInteger(limit) ||
        limit < 1
      ) {
        limit = 10;
      }

      if (limit > 100) {
        limit = 100;
      }

      if (!league) {
        return res.status(400).json({
          success: false,
          league: null,
          season,
          count: 0,
          matches: [],
          source:
            "football-data.org",
          message:
            "Invalid league identifier",
        });
      }

      /* =================================================
      CURRENT SERVICE SUPPORTS PREMIER LEAGUE MATCHES

      Keep this explicit rather than silently returning
      incorrect data for unsupported competitions.
      ================================================= */

      if (league !== "PL") {
        return res.status(400).json({
          success: false,

          league,

          season,

          count: 0,

          matches: [],

          source:
            "football-data.org",

          message:
            "Latest results currently support Premier League only.",
        });
      }

      console.log(
        "======================================"
      );

      console.log(
        "🏁 LATEST RESULTS"
      );

      console.log(
        "League:",
        league
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

      /* =================================================
      GET FINISHED MATCHES

      Provider service handles caching.
      ================================================= */

      const fixtures =
        await getFinishedMatches({
          season,
        });

      /* =================================================
      FILTER SEASON LOCALLY

      The provider service returns the competition
      dataset; this protects us from mixing seasons.
      ================================================= */

      const seasonFixtures =
        fixtures.filter(
          (fixture) => {
            const startDate =
              fixture.season
                ?.startDate;

            if (!startDate) {
              return false;
            }

            const startYear =
              Number(
                String(
                  startDate
                ).substring(0, 4)
              );

            return (
              startYear ===
              season
            );
          }
        );

      /* =================================================
      SORT NEWEST FIRST
      ================================================= */

      seasonFixtures.sort(
        (a, b) => {
          const dateA =
            new Date(
              a?.utcDate || 0
            ).getTime();

          const dateB =
            new Date(
              b?.utcDate || 0
            ).getTime();

          return (
            dateB - dateA
          );
        }
      );

      /* =================================================
      LIMIT
      ================================================= */

      const latestFixtures =
        seasonFixtures.slice(
          0,
          limit
        );

      /* =================================================
      FORMAT
      ================================================= */

      const matches =
        latestFixtures
          .map(
            formatResult
          )
          .filter(Boolean);

      console.log(
        `✅ Results loaded: ${matches.length}`
      );

      return res.json({
        success: true,

        league,

        season,

        count:
          matches.length,

        total:
          seasonFixtures.length,

        matches,

        source:
          "football-data.org",

        message:
          "Latest results loaded",
      });
    } catch (error) {
      console.error(
        "❌ LatestResultsController:",
        error.response?.data ||
          error.message
      );

      if (
        error.response?.status ===
        429
      ) {
        return res.status(
          503
        ).json({
          success: false,

          league:
            req.query.league ||
            "PL",

          season:
            resolveSeason(
              req.query.season
            ),

          count: 0,

          matches: [],

          source:
            "football-data.org",

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

        league:
          req.query.league ||
          "PL",

        season:
          resolveSeason(
            req.query.season
          ),

        count: 0,

        matches: [],

        source:
          "football-data.org",

        message:
          "Unable to load latest results",

        error:
          error.response?.data ||
          error.message,
      });
    }
  };