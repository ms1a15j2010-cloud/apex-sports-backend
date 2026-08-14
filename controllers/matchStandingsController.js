const {
  getMatch,
  getCompetition,
  footballDataGet,
} = require("../services/footballDataApi");

/* =====================================================
MATCH STANDINGS CONTROLLER

This controller NO LONGER uses API-Football.

It uses football-data.org.

Flow:

/api/match/:id/standings
        ↓
getMatch()
        ↓
competition + season
        ↓
/competitions/:competition/standings
        ↓
return the two teams' league positions

No hard-coded standings.
No fake numbers.
===================================================== */


/* =====================================================
GET MATCH STANDINGS
===================================================== */

exports.getStandings =
  async (req, res) => {
    const fixtureId =
      req.params.id;

    try {
      /* =============================================
         VALIDATE MATCH ID
      ============================================= */

      if (!fixtureId) {
        return res.status(400).json({
          success: false,

          fixtureId: null,

          standings: [],

          message:
            "Match ID is required",
        });
      }

      console.log(
        `📊 Loading match standings | Match: ${fixtureId}`
      );

      /* =============================================
         LOAD MATCH

         This uses the migrated/cached football-data.org
         match service.
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

          standings: [],

          message:
            "Match not found",
        });
      }

      /* =============================================
         COMPETITION
      ============================================= */

      const competitionCode =
        match.competition?.code ||
        null;

      const competitionId =
        match.competition?.id ||
        null;

      const seasonStart =
        match.season?.startDate ||
        null;

      const season =
        seasonStart
          ? Number(
              String(
                seasonStart
              ).substring(0, 4)
            )
          : null;

      if (
        !competitionCode
      ) {
        return res.json({
          success: false,

          fixtureId,

          standings: [],

          league: null,

          season,

          message:
            "Competition information is unavailable",
        });
      }

      /* =============================================
         LOAD COMPETITION STANDINGS

         football-data.org endpoint:

         /competitions/{code}/standings
      ============================================= */

      console.log(
        `📊 Loading ${competitionCode} standings | Season: ${
          season || "current"
        }`
      );

      const data =
        await footballDataGet(
          `/competitions/${competitionCode}/standings`,
          season
            ? {
                season,
              }
            : {}
        );

      /* =============================================
         FIND TOTAL TABLE
      ============================================= */

      const totalTable =
        Array.isArray(
          data?.standings
        )
          ? data.standings.find(
              (standing) =>
                String(
                  standing?.type ||
                    ""
                ).toUpperCase() ===
                "TOTAL"
            ) ||
            data.standings[0]
          : null;

      const table =
        Array.isArray(
          totalTable?.table
        )
          ? totalTable.table
          : [];

      if (
        table.length === 0
      ) {
        return res.json({
          success: false,

          fixtureId,

          standings: [],

          league: {
            id:
              competitionId,

            code:
              competitionCode,

            name:
              data?.competition
                ?.name ||
              "Unknown Competition",

            logo:
              data?.competition
                ?.emblem ||
              null,
          },

          season,

          message:
            "No standings available",
        });
      }

      /* =============================================
         TEAM IDS

         These are the teams involved in the match.
      ============================================= */

      const homeTeamId =
        match.homeTeam?.id ??
        null;

      const awayTeamId =
        match.awayTeam?.id ??
        null;

      /* =============================================
         FIND BOTH TEAMS
      ============================================= */

      const homeStanding =
        table.find(
          (row) =>
            Number(
              row?.team?.id
            ) ===
            Number(
              homeTeamId
            )
        );

      const awayStanding =
        table.find(
          (row) =>
            Number(
              row?.team?.id
            ) ===
            Number(
              awayTeamId
            )
        );

      /* =============================================
         NORMALIZE TEAM STANDING
      ============================================= */

      function formatTeamStanding(
        row
      ) {
        if (!row) {
          return null;
        }

        return {
          position:
            row.position ??
            null,

          rank:
            row.position ??
            null,

          team: {
            id:
              row.team?.id ??
              null,

            name:
              row.team?.name ||
              row.team?.shortName ||
              "Unknown Team",

            shortName:
              row.team
                ?.shortName ||
              null,

            tla:
              row.team?.tla ||
              null,

            logo:
              row.team?.crest ||
              null,
          },

          played:
            row.playedGames ??
            0,

          wins:
            row.won ??
            0,

          draws:
            row.draw ??
            0,

          losses:
            row.lost ??
            0,

          points:
            row.points ??
            0,

          goalsFor:
            row.goalsFor ??
            0,

          goalsAgainst:
            row.goalsAgainst ??
            0,

          goalDifference:
            row.goalDifference ??
            0,

          form:
            row.form ||
            null,
        };
      }

      const home =
        formatTeamStanding(
          homeStanding
        );

      const away =
        formatTeamStanding(
          awayStanding
        );

      /* =============================================
         FINAL RESPONSE
      ============================================= */

      console.log(
        `✅ Match standings loaded | Home: ${
          home?.position ??
          "N/A"
        } | Away: ${
          away?.position ??
          "N/A"
        }`
      );

      return res.json({
        success: true,

        fixtureId:
          Number(fixtureId) ||
          fixtureId,

        league: {
          id:
            competitionId,

          code:
            competitionCode,

          name:
            data?.competition
              ?.name ||
            "Unknown Competition",

          logo:
            data?.competition
              ?.emblem ||
            null,

          country:
            data?.area?.name ||
            null,
        },

        season,

        standings: {
          homeTeam:
            home,

          awayTeam:
            away,
        },

        /* Optional full table for future components */

        table:
          table.map(
            formatTeamStanding
          ).filter(Boolean),

        count:
          table.length,

        source:
          "football-data.org",

        message:
          "Match standings loaded",
      });
    } catch (error) {
      console.error(
        "❌ MatchStandingsController:",
        error.response?.data ||
          error.message
      );

      if (
        error.response?.status ===
        429
      ) {
        return res.status(503).json({
          success: false,

          fixtureId,

          standings: [],

          source:
            "football-data.org",

          apiLimitReached:
            true,

          message:
            "Football-data.org request limit reached. Please try again later.",
        });
      }

      return res.status(500).json({
        success: false,

        fixtureId,

        standings: [],

        source:
          "football-data.org",

        message:
          "Unable to load match standings",

        error:
          error.response?.data ||
          error.message,
      });
    }
  };