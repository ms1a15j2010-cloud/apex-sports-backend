const {
  getHeadToHead:
    getFootballDataHeadToHead,
} = require("../services/footballDataApi");

/* =====================================================
HEAD-TO-HEAD CONTROLLER

Provider:
football-data.org

OLD API-Football endpoint:

/fixtures/headtohead

NEW STRATEGY:

Use football-data.org team-match history through
getHeadToHead() in:

services/footballDataApi.js

The service automatically checks the requested/current
season first and then falls back to previous seasons if
there are no finished H2H matches yet.

No API-Football dependency.
===================================================== */


/* =====================================================
FORMAT H2H MATCH

Converts football-data.org structure into a clean
Apex Sports structure.
===================================================== */

function formatHeadToHeadMatch(
  match,
  requestedHomeId,
  requestedAwayId
) {
  if (!match) {
    return null;
  }

  const home =
    match.homeTeam ||
    {};

  const away =
    match.awayTeam ||
    {};

  const competition =
    match.competition ||
    {};

  const season =
    match.season ||
    {};

  const score =
    match.score ||
    {};

  const fullTime =
    score.fullTime ||
    {};

  const halfTime =
    score.halfTime ||
    {};

  /* =================================================
  TEAM IDS
  ================================================= */

  const actualHomeId =
    String(
      home.id ?? ""
    );

  const actualAwayId =
    String(
      away.id ?? ""
    );

  const requestedHome =
    String(
      requestedHomeId
    );

  const requestedAway =
    String(
      requestedAwayId
    );

  /* =================================================
  SCORE
  ================================================= */

  const homeGoals =
    fullTime.home ??
    null;

  const awayGoals =
    fullTime.away ??
    null;

  /* =================================================
  RESULT FROM REQUESTED HOME TEAM'S PERSPECTIVE
  ================================================= */

  let result =
    null;

  if (
    homeGoals !== null &&
    awayGoals !== null
  ) {
    const actualHomeWon =
      homeGoals >
      awayGoals;

    const actualAwayWon =
      awayGoals >
      homeGoals;

    const draw =
      homeGoals ===
      awayGoals;

    if (draw) {
      result = "DRAW";
    } else if (
      actualHomeWon
    ) {
      result =
        actualHomeId ===
        requestedHome
          ? "HOME_WIN"
          : "AWAY_WIN";
    } else if (
      actualAwayWon
    ) {
      result =
        actualAwayId ===
        requestedHome
          ? "HOME_WIN"
          : "AWAY_WIN";
    }
  }

  /* =================================================
  SEASON YEAR
  ================================================= */

  const seasonYear =
    season.startDate
      ? Number(
          String(
            season.startDate
          ).substring(0, 4)
        )
      : null;

  return {
    id:
      match.id ??
      null,

    date:
      match.utcDate ||
      null,

    timestamp:
      match.utcDate
        ? Math.floor(
            new Date(
              match.utcDate
            ).getTime() /
              1000
          )
        : null,

    competition: {
      id:
        competition.id ??
        null,

      name:
        competition.name ||
        "Unknown Competition",

      code:
        competition.code ||
        null,

      emblem:
        competition.emblem ||
        null,
    },

    season: {
      id:
        season.id ??
        null,

      startDate:
        season.startDate ||
        null,

      endDate:
        season.endDate ||
        null,

      year:
        seasonYear,
    },

    home: {
      id:
        home.id ??
        null,

      name:
        home.name ||
        home.shortName ||
        "Home Team",

      shortName:
        home.shortName ||
        null,

      tla:
        home.tla ||
        null,

      logo:
        home.crest ||
        null,
    },

    away: {
      id:
        away.id ??
        null,

      name:
        away.name ||
        away.shortName ||
        "Away Team",

      shortName:
        away.shortName ||
        null,

      tla:
        away.tla ||
        null,

      logo:
        away.crest ||
        null,
    },

    score: {
      winner:
        score.winner ||
        null,

      duration:
        score.duration ||
        "REGULAR",

      home:
        homeGoals,

      away:
        awayGoals,

      halftime: {
        home:
          halfTime.home ??
          null,

        away:
          halfTime.away ??
          null,
      },

      fulltime: {
        home:
          homeGoals,

        away:
          awayGoals,
      },

      penalties: {
        home:
          score.penalties
            ?.home ??
          null,

        away:
          score.penalties
            ?.away ??
          null,
      },

      extraTime: {
        home:
          score.extraTime
            ?.home ??
          null,

        away:
          score.extraTime
            ?.away ??
          null,
      },
    },

    goals: {
      home:
        homeGoals,

      away:
        awayGoals,
    },

    status: {
      short:
        match.status ===
        "FINISHED"
          ? "FT"
          : match.status ||
            "UNKNOWN",

      long:
        match.status ||
        "UNKNOWN",
    },

    result,
  };
}


/* =====================================================
GET HEAD-TO-HEAD

GET:

/api/headtohead/:home/:away

Example:

/api/headtohead/57/65

57 = Arsenal
65 = Manchester City

Optional:

/api/headtohead/57/65?season=2025
===================================================== */

exports.getHeadToHead =
  async (req, res) => {
    const {
      home,
      away,
    } = req.params;

    try {
      /* =============================================
         VALIDATE IDS
      ============================================= */

      if (
        !home ||
        !away
      ) {
        return res.status(400).json({
          success: false,

          home:
            home || null,

          away:
            away || null,

          season: null,

          requestedSeason: null,

          count: 0,

          matches: [],

          summary: {
            homeWins: 0,
            draws: 0,
            awayWins: 0,
            totalGoals: 0,
          },

          source:
            "football-data.org",

          message:
            "Both home and away team IDs are required",
        });
      }

      const homeId =
        Number(home);

      const awayId =
        Number(away);

      if (
        !Number.isInteger(
          homeId
        ) ||
        !Number.isInteger(
          awayId
        ) ||
        homeId <= 0 ||
        awayId <= 0
      ) {
        return res.status(400).json({
          success: false,

          home:
            home,

          away:
            away,

          season: null,

          requestedSeason: null,

          count: 0,

          matches: [],

          summary: {
            homeWins: 0,
            draws: 0,
            awayWins: 0,
            totalGoals: 0,
          },

          source:
            "football-data.org",

          message:
            "Invalid team IDs",
        });
      }

      /* =============================================
         OPTIONAL SEASON
      ============================================= */

      const querySeason =
        req.query.season
          ? Number(
              req.query.season
            )
          : null;

      const season =
        Number.isInteger(
          querySeason
        ) &&
        querySeason >= 1900 &&
        querySeason <= 2100
          ? querySeason
          : null;

      console.log(
        `🤝 H2H request: ${homeId} vs ${awayId}${
          season
            ? ` | Requested season: ${season}`
            : ""
        }`
      );

      /* =============================================
         LOAD H2H FROM FOOTBALL-DATA.ORG SERVICE
      ============================================= */

      const h2hData =
        await getFootballDataHeadToHead(
          homeId,
          awayId,
          {
            ...(season
              ? {
                  season,
                }
              : {}),

            limit: 10,
          }
        );

      const rawMatches =
        Array.isArray(
          h2hData?.matches
        )
          ? h2hData.matches
          : [];

      /* =============================================
         FORMAT MATCHES
      ============================================= */

      const matches =
        rawMatches
          .map(
            (match) =>
              formatHeadToHeadMatch(
                match,
                homeId,
                awayId
              )
          )
          .filter(Boolean);

      /* =============================================
         CALCULATE SUMMARY

         "home" and "away" refer to the teams requested
         by the frontend, NOT necessarily the home/away
         side in each historical match.
      ============================================= */

      let homeWins = 0;

      let draws = 0;

      let awayWins = 0;

      let totalGoals = 0;

      for (
        const match of matches
      ) {
        const homeGoals =
          match.score
            ?.fulltime
            ?.home;

        const awayGoals =
          match.score
            ?.fulltime
            ?.away;

        if (
          homeGoals ===
            null ||
          homeGoals ===
            undefined ||
          awayGoals ===
            null ||
          awayGoals ===
            undefined
        ) {
          continue;
        }

        const numericHomeGoals =
          Number(
            homeGoals
          );

        const numericAwayGoals =
          Number(
            awayGoals
          );

        totalGoals +=
          numericHomeGoals +
          numericAwayGoals;

        const actualHomeTeamId =
          String(
            match.home?.id ??
              ""
          );

        const requestedHomeWasActualHome =
          actualHomeTeamId ===
          String(homeId);

        const requestedHomeGoals =
          requestedHomeWasActualHome
            ? numericHomeGoals
            : numericAwayGoals;

        const requestedAwayGoals =
          requestedHomeWasActualHome
            ? numericAwayGoals
            : numericHomeGoals;

        if (
          requestedHomeGoals >
          requestedAwayGoals
        ) {
          homeWins++;
        } else if (
          requestedHomeGoals <
          requestedAwayGoals
        ) {
          awayWins++;
        } else {
          draws++;
        }
      }

      /* =============================================
         RESPONSE
      ============================================= */

      return res.json({
        success: true,

        home:
          homeId,

        away:
          awayId,

        season:
          h2hData?.season ||
          null,

        requestedSeason:
          h2hData?.requestedSeason ||
          season ||
          null,

        count:
          matches.length,

        matches,

        summary: {
          homeWins,

          draws,

          awayWins,

          totalGoals,
        },

        source:
          "football-data.org",

        message:
          matches.length > 0
            ? "Head-to-head loaded"
            : "No head-to-head matches found",
      });
    } catch (error) {
      console.error(
        "❌ HeadToHeadController:",
        error.response?.data ||
          error.message
      );

      /* =============================================
         RATE LIMIT
      ============================================= */

      if (
        error.response?.status ===
        429
      ) {
        return res.status(503).json({
          success: false,

          home:
            home || null,

          away:
            away || null,

          season: null,

          requestedSeason:
            req.query.season
              ? Number(
                  req.query.season
                )
              : null,

          count: 0,

          matches: [],

          summary: {
            homeWins: 0,
            draws: 0,
            awayWins: 0,
            totalGoals: 0,
          },

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

      return res.status(500).json({
        success: false,

        home:
          home || null,

        away:
          away || null,

        season: null,

        requestedSeason:
          req.query.season
            ? Number(
                req.query.season
              )
            : null,

        count: 0,

        matches: [],

        summary: {
          homeWins: 0,
          draws: 0,
          awayWins: 0,
          totalGoals: 0,
        },

        source:
          "football-data.org",

        message:
          "Unable to load head-to-head",

        error:
          error.response?.data ||
          error.message,
      });
    }
  };