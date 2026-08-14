const {
  getMatch,
} = require("../services/footballDataApi");

/* =====================================================
MATCH STATISTICS CONTROLLER

IMPORTANT:

This controller NO LONGER uses:

services/footballApi.js

It uses:

services/footballDataApi.js

football-data.org does not provide an API-Football-style
/fixtures/statistics endpoint.

Therefore this controller builds the statistics object
from the real match resource.

Available real values include:

- score
- half-time score
- full-time score
- match status
- match duration
- matchday
- competition
- season
- winner

Advanced metrics such as:

- possession
- shots
- shots on target
- corners
- fouls
- passes
- tackles

are returned as null because football-data.org does not
provide them through the same Match Statistics endpoint.

We NEVER invent these values.
===================================================== */

/* =====================================================
FORMAT TEAM STATISTICS

Creates the structure expected by the existing
Apex Sports frontend as much as possible.
===================================================== */

function formatTeamStatistics({
  team,
  score,
  isHome,
}) {
  const fullTime =
    score?.fullTime || {};

  const halfTime =
    score?.halfTime || {};

  const homeScore =
    fullTime.home ?? null;

  const awayScore =
    fullTime.away ?? null;

  const teamGoals =
    isHome
      ? homeScore
      : awayScore;

  const opponentGoals =
    isHome
      ? awayScore
      : homeScore;

  let result =
    null;

  if (
    teamGoals !== null &&
    opponentGoals !== null
  ) {
    if (
      teamGoals >
      opponentGoals
    ) {
      result = "WIN";
    } else if (
      teamGoals <
      opponentGoals
    ) {
      result = "LOSS";
    } else {
      result = "DRAW";
    }
  }

  return {
    team: {
      id:
        team?.id ?? null,

      name:
        team?.name ||
        team?.shortName ||
        "Unknown Team",

      logo:
        team?.crest ||
        null,

      shortName:
        team?.shortName ||
        null,

      tla:
        team?.tla ||
        null,
    },

    /* ===============================================
       RESULT
    =============================================== */

    result,

    goals: {
      total:
        teamGoals,

      firstHalf:
        isHome
          ? halfTime.home ?? null
          : halfTime.away ?? null,

      secondHalf:
        teamGoals !== null &&
        (
          isHome
            ? halfTime.home
            : halfTime.away
        ) !== null
          ? teamGoals -
            (
              isHome
                ? halfTime.home
                : halfTime.away
            )
          : null,
    },

    /* ===============================================
       API-FOOTBALL COMPATIBILITY

       Real provider does not expose these metrics
       through the Match resource.
    =============================================== */

    possession: null,

    shots: {
      total: null,
      on: null,
      off: null,
      blocked: null,
    },

    passes: {
      total: null,
      accurate: null,
      accuracy: null,
    },

    corners: null,

    fouls: null,

    offsides: null,

    yellowCards: null,

    redCards: null,

    tackles: null,

    interceptions: null,

    clearances: null,

    saves: null,
  };
}

/* =====================================================
GET MATCH STATISTICS
=====================================================

GET:

/api/match/:id/statistics
===================================================== */

exports.getStatistics =
  async (req, res) => {
    const fixtureId =
      req.params.id;

    try {
      if (!fixtureId) {
        return res.status(400).json({
          success: false,

          fixtureId: null,

          count: 0,

          statistics: [],

          message:
            "Match ID is required",
        });
      }

      console.log(
        `📊 Loading match statistics from football-data.org | Match: ${fixtureId}`
      );

      /* =============================================
         LOAD SINGLE MATCH

         Uses the cached getMatch() service.
      ============================================= */

      const match =
        await getMatch(
          fixtureId
        );

      if (
        !match ||
        !match.id
      ) {
        return res.status(404).json({
          success: false,

          fixtureId,

          count: 0,

          statistics: [],

          message:
            "Match not found",
        });
      }

      /* =============================================
         HOME STATISTICS
      ============================================= */

      const homeStatistics =
        formatTeamStatistics({
          team:
            match.homeTeam,

          score:
            match.score,

          isHome: true,
        });

      /* =============================================
         AWAY STATISTICS
      ============================================= */

      const awayStatistics =
        formatTeamStatistics({
          team:
            match.awayTeam,

          score:
            match.score,

          isHome: false,
        });

      /* =============================================
         MATCH SUMMARY

         Real data from football-data.org.
      ============================================= */

      const statistics = [
        homeStatistics,
        awayStatistics,
      ];

      /* =============================================
         RESPONSE
      ============================================= */

      return res.json({
        success: true,

        fixtureId:

          Number(fixtureId) ||
          fixtureId,

        count:
          statistics.length,

        statistics,

        match: {
          id:
            match.id,

          status:
            match.status ||
            null,

          minute:
            match.minute ??
            null,

          injuryTime:
            match.injuryTime ??
            null,

          duration:
            match.score
              ?.duration ||
            "REGULAR",

          winner:
            match.score
              ?.winner ||
            null,

          score: {
            home:
              match.score
                ?.fullTime
                ?.home ??
              null,

            away:
              match.score
                ?.fullTime
                ?.away ??
              null,
          },

          halftime: {
            home:
              match.score
                ?.halfTime
                ?.home ??
              null,

            away:
              match.score
                ?.halfTime
                ?.away ??
              null,
          },
        },

        source:
          "football-data.org",

        advancedStatisticsAvailable:
          false,

        message:
          "Match statistics loaded",
      });
    } catch (error) {
      console.error(
        "❌ StatisticsController football-data.org:",
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

          fixtureId,

          count: 0,

          statistics: [],

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

        fixtureId,

        count: 0,

        statistics: [],

        source:
          "football-data.org",

        message:
          "Unable to load match statistics",

        error:
          error.response?.data ||
          error.message,
      });
    }
  };