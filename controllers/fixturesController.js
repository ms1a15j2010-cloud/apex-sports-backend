const {
  getPremierLeagueMatches,
} = require("../services/footballDataApi");

/* =====================================================
FIXTURES CONTROLLER

Provider:

football-data.org

Frontend endpoint:

GET /api/fixtures/:league

Current supported league:

epl / premier-league / pl
===================================================== */


/* =====================================================
FORMAT FOOTBALL-DATA.ORG FIXTURE

football-data.org:

match.id
match.utcDate
match.homeTeam
match.awayTeam
match.status
match.score
match.competition
match.season
match.area

Apex Sports format:

fixture
league
home
away
teams
status
score
===================================================== */

function formatFootballDataFixture(
  match
) {
  if (!match) {
    return null;
  }

  const matchDate =
    match.utcDate || null;

  const homeTeam =
    match.homeTeam || {};

  const awayTeam =
    match.awayTeam || {};

  /* =================================================
  STATUS
  ================================================= */

  let statusShort =
    match.status || "TBD";

  switch (
    match.status
  ) {
    case "SCHEDULED":
      statusShort = "NS";
      break;

    case "TIMED":
      statusShort = "NS";
      break;

    case "IN_PLAY":
      statusShort = "LIVE";
      break;

    case "PAUSED":
      statusShort = "HT";
      break;

    case "FINISHED":
      statusShort = "FT";
      break;

    case "POSTPONED":
      statusShort = "PST";
      break;

    case "SUSPENDED":
      statusShort = "SUS";
      break;

    case "CANCELLED":
      statusShort = "CANC";
      break;

    default:
      statusShort =
        match.status || "TBD";
      break;
  }

  /* =================================================
  SEASON
  ================================================= */

  const seasonStartYear =
    match.season?.startDate
      ? Number(
          String(
            match.season.startDate
          ).substring(
            0,
            4
          )
        )
      : null;

  /* =================================================
  RETURN APEX SPORTS FORMAT
  ================================================= */

  return {
    fixture: {
      id:
        match.id ?? null,

      date:
        matchDate,

      timestamp:
        matchDate
          ? Math.floor(
              new Date(
                matchDate
              ).getTime() /
                1000
            )
          : null,

      timezone:
        "UTC",

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
        seasonStartYear,

      code:
        match.competition?.code ||
        "PL",
    },

    home: {
      id:
        homeTeam.id ??
        null,

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
        awayTeam.id ??
        null,

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

    /* =================================================
       DIRECT TEAM ALIASES

       Some older Apex Sports components use:

       teams.home
       teams.away
    ================================================= */

    teams: {
      home: {
        id:
          homeTeam.id ??
          null,

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
          awayTeam.id ??
          null,

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

    /* =================================================
       STATUS
    ================================================= */

    status: {
      short:
        statusShort,

      long:
        match.status ||
        "Unknown",

      elapsed:
        null,
    },

    /* =================================================
       SCORE
    ================================================= */

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

    /* =================================================
       PROVIDER-NATIVE FIELDS
    ================================================= */

    competition:
      match.competition ||
      null,

    season:
      match.season ||
      null,

    rawStatus:
      match.status ||
      null,
  };
}


/* =====================================================
GET FIXTURES

GET /api/fixtures/epl

Examples:

/api/fixtures/epl

/api/fixtures/epl?season=2025

/api/fixtures/epl?page=1&limit=10

/api/fixtures/epl?season=2025&page=2&limit=20
===================================================== */

exports.getFixtures =
  async (req, res) => {
    try {
      /* =============================================
         LEAGUE
      ============================================= */

      const league =
        String(
          req.params.league ||
            ""
        )
          .trim()
          .toLowerCase();

      const supportedLeagues = [
        "epl",
        "pl",
        "premier-league",
        "premierleague",
      ];

      if (
        !supportedLeagues.includes(
          league
        )
      ) {
        return res.status(400).json({
          success: false,

          season: null,

          page: 1,

          limit: 10,

          total: 0,

          totalPages: 0,

          count: 0,

          league: null,

          fixtures: [],

          message:
            "This football-data.org fixtures integration currently supports Premier League only.",
        });
      }

      /* =============================================
         PAGINATION
      ============================================= */

      let page =
        Number(
          req.query.page
        ) || 1;

      let limit =
        Number(
          req.query.limit
        ) || 10;

      if (
        !Number.isInteger(page) ||
        page < 1
      ) {
        page = 1;
      }

      if (
        !Number.isInteger(limit) ||
        limit < 1
      ) {
        limit = 10;
      }

      if (
        limit > 100
      ) {
        limit = 100;
      }

      /* =============================================
         SEASON

         football-data.org uses the starting year:

         2025 = 2025/26
         2026 = 2026/27
      ============================================= */

      let requestedSeason =
        null;

      if (
        req.query.season !==
          undefined &&
        req.query.season !==
          null &&
        String(
          req.query.season
        ).trim() !== ""
      ) {
        const season =
          Number(
            req.query.season
          );

        if (
          Number.isInteger(
            season
          ) &&
          season >= 2000 &&
          season <= 2100
        ) {
          requestedSeason =
            season;
        } else {
          return res.status(400).json({
            success: false,

            season: null,

            page,

            limit,

            total: 0,

            totalPages: 0,

            count: 0,

            league: null,

            fixtures: [],

            message:
              "Invalid season. Expected a four-digit season year such as 2025 or 2026.",
          });
        }
      }

      /* =============================================
         LOG REQUEST
      ============================================= */

      console.log(
        "======================================"
      );

      console.log(
        "📅 FIXTURES"
      );

      console.log(
        "Competition: PL"
      );

      console.log(
        "Season:",
        requestedSeason ||
          "current"
      );

      console.log(
        "Page:",
        page
      );

      console.log(
        "Limit:",
        limit
      );

      console.log(
        "======================================"
      );

      /* =============================================
         PROVIDER REQUEST

         IMPORTANT CORRECTION:

         The requested season is now passed directly
         into getPremierLeagueMatches().

         This means:

         season=2025
           ↓
         football-data.org:
         ?season=2025

         season=2026
           ↓
         football-data.org:
         ?season=2026

         This also creates separate fixture-cache keys.
      ============================================= */

      const providerParams =
        requestedSeason
          ? {
              season:
                requestedSeason,
            }
          : {};

      console.log(
        "🌐 Fixtures provider params:",
        providerParams
      );

      const response =
        await getPremierLeagueMatches(
          providerParams
        );

      const matches =
        Array.isArray(
          response?.matches
        )
          ? response.matches
          : [];

      console.log(
        `⚽ football-data.org fixtures received: ${matches.length}`
      );

      /* =============================================
         IMPORTANT:

         We NO LONGER manually filter the season here.

         football-data.org has already applied:

         ?season=2025
         or
         ?season=2026

         Keeping another filter here could hide valid
         provider results and make debugging confusing.
      ============================================= */

      const sortedMatches =
        [...matches].sort(
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
              dateA - dateB
            );
          }
        );

      /* =============================================
         FORMAT
      ============================================= */

      const fixtures =
        sortedMatches
          .map(
            (match) => {
              try {
                return formatFootballDataFixture(
                  match
                );
              } catch (error) {
                console.error(
                  "❌ Fixture formatting error:",
                  error.message
                );

                return null;
              }
            }
          )
          .filter(Boolean);

      /* =============================================
         PAGINATION
      ============================================= */

      const total =
        fixtures.length;

      const start =
        (page - 1) *
        limit;

      const end =
        start + limit;

      const paginatedFixtures =
        fixtures.slice(
          start,
          end
        );

      const totalPages =
        total > 0
          ? Math.ceil(
              total / limit
            )
          : 0;

      /* =============================================
         LEAGUE INFORMATION
      ============================================= */

      const firstMatch =
        sortedMatches[0] ||
        null;

      const competition =
        firstMatch?.competition ||
        {};

      const area =
        firstMatch?.area ||
        {};

      const seasonData =
        firstMatch?.season ||
        {};

      const actualSeason =
        seasonData?.startDate
          ? Number(
              String(
                seasonData.startDate
              ).substring(
                0,
                4
              )
            )
          : requestedSeason;

      const leagueInfo = {
        id:
          competition.id ??
          2021,

        name:
          competition.name ||
          "Premier League",

        code:
          competition.code ||
          "PL",

        country:
          area.name ||
          "England",

        logo:
          competition.emblem ||
          "https://crests.football-data.org/PL.png",

        flag:
          area.flag ||
          null,

        season:
          actualSeason,
      };

      /* =============================================
         FINAL RESPONSE
      ============================================= */

      console.log(
        `✅ Fixtures loaded | Total: ${total} | Page: ${page}/${totalPages}`
      );

      return res.json({
        success: true,

        season:
          actualSeason,

        page,

        limit,

        total,

        totalPages,

        count:
          paginatedFixtures.length,

        league:
          leagueInfo,

        fixtures:
          paginatedFixtures,

        source:
          "football-data.org",

        message:
          "Fixtures loaded",
      });
    } catch (error) {
      console.error(
        "❌ FixturesController:",
        error.response?.data ||
          error.message
      );

      const status =
        error.response?.status;

      /* =============================================
         RATE LIMIT
      ============================================= */

      if (
        status === 429
      ) {
        return res.status(503).json({
          success: false,

          season: null,

          page:
            Number(
              req.query.page
            ) || 1,

          limit:
            Number(
              req.query.limit
            ) || 10,

          total: 0,

          totalPages: 0,

          count: 0,

          league: null,

          fixtures: [],

          source:
            "football-data.org",

          apiLimitReached:
            true,

          message:
            "Football-data.org request limit reached. Please try again later.",
        });
      }

      /* =============================================
         GENERAL ERROR
      ============================================= */

      return res.status(
        status >= 400 &&
        status < 600
          ? status
          : 500
      ).json({
        success: false,

        season: null,

        page:
          Number(
            req.query.page
          ) || 1,

        limit:
          Number(
            req.query.limit
          ) || 10,

        total: 0,

        totalPages: 0,

        count: 0,

        league: null,

        fixtures: [],

        source:
          "football-data.org",

        message:
          "Unable to load fixtures from football-data.org",

        error:
          error.response?.data ||
          error.message,
      });
    }
  };