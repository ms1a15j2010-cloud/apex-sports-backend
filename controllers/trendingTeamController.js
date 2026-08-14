const {
  getCompetitionTeams,
} = require("../services/footballDataApi");

/* =====================================================
TRENDING TEAMS CONTROLLER

This controller no longer uses:

services/footballApi.js

It now uses football-data.org.

We build the trending list from real teams in the major
competitions already supported by Apex Sports.

Priority competitions:

PL   Premier League
PD   La Liga
BL1  Bundesliga
SA   Serie A
FL1  Ligue 1

No fake teams are generated.
===================================================== */

/* =====================================================
TRENDING TEAM PRIORITY

Lower number = higher priority.
===================================================== */

const TRENDING_TEAM_PRIORITY = [
  {
    competition: "PL",
    tla: [
      "ARS",
      "LIV",
      "MUN",
      "MCI",
    ],
  },

  {
    competition: "PD",
    tla: [
      "RMA",
      "FCB",
      "ATM",
    ],
  },

  {
    competition: "BL1",
    tla: [
      "BAY",
      "BVB",
    ],
  },

  {
    competition: "SA",
    tla: [
      "INT",
      "MIL",
      "JUV",
    ],
  },

  {
    competition: "FL1",
    tla: [
      "PSG",
    ],
  },
];

/* =====================================================
GET TEAM MATCH KEY
===================================================== */

function normalizeTla(value) {
  return String(
    value || ""
  )
    .trim()
    .toUpperCase();
}

/* =====================================================
FORMAT TEAM
===================================================== */

function formatTeam(
  team,
  competition
) {
  if (!team) {
    return null;
  }

  return {
    id:
      team.id ??
      null,

    name:
      team.name ||
      team.shortName ||
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

    country:
      team.area?.name ||
      null,

    countryCode:
      team.area?.code ||
      null,

    flag:
      team.area?.flag ||
      null,

    founded:
      team.founded ??
      null,

    national:
      team.national ??
      false,

    venue:
      team.venue ||
      null,

    competition: {
      code:
        competition,

      name:
        competition === "PL"
          ? "Premier League"
          : competition === "PD"
            ? "La Liga"
            : competition === "BL1"
              ? "Bundesliga"
              : competition === "SA"
                ? "Serie A"
                : "Ligue 1",
    },

    source:
      "football-data.org",
  };
}

/* =====================================================
GET TRENDING TEAMS

GET:

/api/trending-teams

Optional:

/api/trending-teams?season=2026
===================================================== */

exports.getTrendingTeams =
  async (req, res) => {
    try {
      const requestedSeason =
        Number(
          req.query.season
        );

      const season =
        Number.isInteger(
          requestedSeason
        ) &&
        requestedSeason >= 1900 &&
        requestedSeason <= 2100
          ? requestedSeason
          : new Date().getFullYear();

      console.log(
        `🔥 Loading trending teams from football-data.org | Season: ${season}`
      );

      const teamMap =
        new Map();

      /* =============================================
         LOAD MAJOR COMPETITIONS
      ============================================= */

      await Promise.all(
        [
          "PL",
          "PD",
          "BL1",
          "SA",
          "FL1",
        ].map(
          async (
            competition
          ) => {
            try {
              const teams =
                await getCompetitionTeams(
                  competition
                );

              for (
                const team of teams
              ) {
                if (
                  !team ||
                  team.id == null
                ) {
                  continue;
                }

                const key =
                  `${competition}:${team.id}`;

                teamMap.set(
                  key,
                  {
                    team,

                    competition,
                  }
                );
              }
            } catch (error) {
              console.warn(
                `⚠️ Trending teams competition ${competition} failed:`,
                error.response?.status ||
                  error.message
              );
            }
          }
        )
      );

      /* =============================================
         SELECT PRIORITY TEAMS
      ============================================= */

      const selected =
        [];

      for (
        const priority
          of TRENDING_TEAM_PRIORITY
      ) {
        for (
          const desiredTla
            of priority.tla
        ) {
          const normalizedDesired =
            normalizeTla(
              desiredTla
            );

          const found =
            Array.from(
              teamMap.values()
            ).find(
              ({
                team,
                competition,
              }) =>
                competition ===
                  priority.competition &&
                normalizeTla(
                  team?.tla
                ) ===
                  normalizedDesired
            );

          if (found) {
            selected.push(
              formatTeam(
                found.team,
                found.competition
              )
            );
          }
        }
      }

      /* =============================================
         REMOVE DUPLICATES
      ============================================= */

      const teams =
        Array.from(
          new Map(
            selected
              .filter(Boolean)
              .map(
                (team) => [
                  `${team.competition.code}:${team.id}`,
                  team,
                ]
              )
          ).values()
        );

      /* =============================================
         FALLBACK

         If one or more priority teams are unavailable,
         use the first available teams from major
         competitions rather than inventing them.
      ============================================= */

      if (
        teams.length === 0
      ) {
        const fallback =
          Array.from(
            teamMap.values()
          )
            .slice(0, 10)
            .map(
              ({
                team,
                competition,
              }) =>
                formatTeam(
                  team,
                  competition
                )
            )
            .filter(Boolean);

        return res.json({
          success:
            fallback.length > 0,

          season,

          count:
            fallback.length,

          teams:
            fallback,

          source:
            "football-data.org",

          message:
            fallback.length > 0
              ? "Trending teams loaded"
              : "No trending teams available",
        });
      }

      /* =============================================
         LIMIT
      ============================================= */

      const limitedTeams =
        teams.slice(
          0,
          10
        );

      console.log(
        `✅ Trending teams loaded: ${limitedTeams.length}`
      );

      /* =============================================
         RESPONSE
      ============================================= */

      return res.json({
        success: true,

        season,

        count:
          limitedTeams.length,

        teams:
          limitedTeams,

        source:
          "football-data.org",

        message:
          "Trending teams loaded",
      });
    } catch (error) {
      console.error(
        "❌ TrendingTeamController football-data.org:",
        error.response?.data ||
          error.message
      );

      if (
        error.response?.status ===
        429
      ) {
        return res.status(503).json({
          success: false,

          season:
            req.query.season ||
            null,

          count: 0,

          teams: [],

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

        season:
          req.query.season ||
          null,

        count: 0,

        teams: [],

        source:
          "football-data.org",

        message:
          "Unable to load trending teams",

        error:
          error.response?.data ||
          error.message,
      });
    }
  };