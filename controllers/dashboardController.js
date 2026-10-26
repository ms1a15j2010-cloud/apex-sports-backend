const {
  getCompetition,
  getCompetitionTeams,
  getPremierLeagueMatches,
} = require("../services/footballDataApi");

/* =====================================================
DASHBOARD HERO CONTROLLER

IMPORTANT:

This controller NO LONGER uses:

services/footballApi.js

It now uses:

services/footballDataApi.js

Current migration target:

Premier League
football-data.org code: PL

Response remains compatible with the existing
Apex Sports frontend:

{
  success: true,
  hero: {
    leagues,
    teams,
    players,
    fixtures
  }
}

No fake values are generated.
===================================================== */


/* =====================================================
GET SEASON

Examples:

2026 = Premier League 2026/27
2025 = Premier League 2025/26
===================================================== */

function resolveSeason(
  value
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

  return new Date().getMonth() >= 6
    ? new Date().getFullYear()
    : new Date().getFullYear() - 1;
}


/* =====================================================
COUNT UNIQUE PLAYERS

football-data.org may provide squad information inside
competition team objects.

We count unique player IDs so a player appearing in more
than one competition/team response is not double-counted.
===================================================== */

function countUniquePlayers(
  teams
) {
  if (
    !Array.isArray(
      teams
    )
  ) {
    return 0;
  }

  const players =
    new Map();

  for (
    const team of teams
  ) {
    if (
      !Array.isArray(
        team?.squad
      )
    ) {
      continue;
    }

    for (
      const player of
        team.squad
    ) {
      if (!player) {
        continue;
      }

      const playerId =
        player.id;

      if (
        playerId !==
        undefined &&
        playerId !==
        null
      ) {
        players.set(
          playerId,
          player
        );
      }
    }
  }

  return players.size;
}


/* =====================================================
GET DASHBOARD HERO
=====================================================

GET:

/api/dashboard/hero

Optional:

/api/dashboard/hero?season=2026
===================================================== */

exports.getDashboardHero =
  async (req, res) => {
    try {
      /* =============================================
         CONFIG
      ============================================= */

      const competition =
        "PL";

      const season =
        resolveSeason(
          req.query.season
        );

      console.log(
        `📊 Loading Dashboard Hero | Competition: ${competition} | Season: ${season}`
      );

      /* =============================================
         LOAD CORE DATA

         These requests use the migrated football-data.org
         service.

         1. Competition
         2. Teams
         3. Fixtures
      ============================================= */

      const [
        competitionData,
        teams,
        fixturesData,
      ] =
        await Promise.all([
          getCompetition(
            competition
          ),

          getCompetitionTeams(
            competition
          ),

          getPremierLeagueMatches({
            season,
          }),
        ]);

      /* =============================================
         LEAGUES

         We are currently displaying the configured
         Premier League competition.
      ============================================= */

      const leagues =
        competitionData
          ? 1
          : 0;

      /* =============================================
         TEAMS
      ============================================= */

      const teamCount =
        Array.isArray(
          teams
        )
          ? teams.length
          : 0;

      /* =============================================
         PLAYERS

         Use real squad information when available.
      ============================================= */

      const playerCount =
        countUniquePlayers(
          teams
        );

      /* =============================================
         FIXTURES

         football-data.org returns:

         {
           matches: [...]
         }
      ============================================= */

      const fixtureCount =
        Array.isArray(
          fixturesData?.matches
        )
          ? fixturesData
              .matches.length
          : 0;

      /* =============================================
         RESPONSE
      ============================================= */

      console.log(
        `✅ Dashboard Hero loaded | League: ${leagues} | Teams: ${teamCount} | Players: ${playerCount} | Fixtures: ${fixtureCount}`
      );

      return res.json({
        success: true,

        hero: {
          leagues,

          teams:
            teamCount,

          players:
            playerCount,

          fixtures:
            fixtureCount,
        },

        league: {
          id:
            competitionData?.id ??
            null,

          name:
            competitionData?.name ||
            "Premier League",

          code:
            competitionData?.code ||
            competition,

          country:
            competitionData
              ?.area?.name ||
            "England",

          logo:
            competitionData
              ?.emblem ||
            "https://crests.football-data.org/PL.png",

          season,
        },

        source:
          "football-data.org",

        message:
          "Dashboard hero loaded",
      });
    } catch (error) {
      console.error(
        "❌ DashboardController football-data.org:",
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

          hero: {
            leagues: 0,

            teams: 0,

            players: 0,

            fixtures: 0,
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
         FALLBACK RESPONSE

         Keep the frontend contract intact.
      ============================================= */

      return res.status(500).json({
        success: false,

        hero: {
          leagues: 0,

          teams: 0,

          players: 0,

          fixtures: 0,
        },

        source:
          "football-data.org",

        message:
          "Unable to load dashboard hero",

        error:
          error.response?.data ||
          error.message,
      });
    }
  };