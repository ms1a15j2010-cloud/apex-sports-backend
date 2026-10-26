const {
  getCompetitions,
} = require("../services/footballDataApi");

/* =====================================================
TOP LEAGUES CONTROLLER

IMPORTANT:

This controller NO LONGER uses:

services/footballApi.js

It now uses:

services/footballDataApi.js

football-data.org provides competitions through:

/competitions

Apex Sports keeps a curated list of major football
competitions so the Dashboard "Top Leagues" section
remains predictable and relevant.

Current supported competitions:

PL   = Premier League
PD   = La Liga
BL1  = Bundesliga
SA   = Serie A
FL1  = Ligue 1

No fake league data is generated.
===================================================== */


/* =====================================================
TOP COMPETITION PRIORITY

Lower number = higher priority.
===================================================== */

const TOP_COMPETITION_PRIORITY = {
  PL: 1,
  PD: 2,
  BL1: 3,
  SA: 4,
  FL1: 5,
};


/* =====================================================
GET TOP LEAGUES

GET:

/api/top-leagues

Optional:

/api/top-leagues?season=2026
===================================================== */

exports.getTopLeagues =
  async (req, res) => {
    try {
      /* =============================================
         SEASON
      ============================================= */

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
          : (new Date().getMonth() >= 6
              ? new Date().getFullYear()
              : new Date().getFullYear() - 1);

      console.log(
        `🏆 Loading top leagues from football-data.org | Season: ${season}`
      );

      /* =============================================
         LOAD COMPETITIONS
      ============================================= */

      const competitions =
        await getCompetitions();

      if (
        !Array.isArray(
          competitions
        ) ||
        competitions.length === 0
      ) {
        return res.json({
          success: false,

          season,

          count: 0,

          leagues: [],

          source:
            "football-data.org",

          message:
            "No leagues found",
        });
      }

      /* =============================================
         FILTER MAJOR COMPETITIONS
      ============================================= */

      const top =
        competitions
          .filter(
            (competition) => {
              const code =
                String(
                  competition?.code ||
                    ""
                )
                  .trim()
                  .toUpperCase();

              return (
                TOP_COMPETITION_PRIORITY[
                  code
                ] !== undefined
              );
            }
          )
          .sort(
            (a, b) => {
              const codeA =
                String(
                  a?.code || ""
                )
                  .trim()
                  .toUpperCase();

              const codeB =
                String(
                  b?.code || ""
                )
                  .trim()
                  .toUpperCase();

              return (
                TOP_COMPETITION_PRIORITY[
                  codeA
                ] -
                TOP_COMPETITION_PRIORITY[
                  codeB
                ]
              );
            }
          )
          .slice(0, 10)
          .map(
            (competition) => {
              const code =
                String(
                  competition?.code ||
                    ""
                )
                  .trim()
                  .toUpperCase();

              return {
                id:
                  competition?.id ??
                  null,

                name:
                  competition?.name ||
                  "Unknown Competition",

                code,

                logo:
                  competition?.emblem ||
                  null,

                emblem:
                  competition?.emblem ||
                  null,

                type:
                  competition?.type ||
                  "LEAGUE",

                country:
                  competition?.area
                    ?.name ||
                  null,

                areaCode:
                  competition?.area
                    ?.code ||
                  null,

                flag:
                  competition?.area
                    ?.flag ||
                  null,

                season,
              };
            }
          );

      /* =============================================
         RESPONSE
      ============================================= */

      console.log(
        `✅ Top leagues loaded: ${top.length}`
      );

      return res.json({
        success: true,

        season,

        count:
          top.length,

        leagues:
          top,

        source:
          "football-data.org",

        message:
          "Top leagues loaded",
      });
    } catch (error) {
      console.error(
        "❌ TopLeagueController football-data.org:",
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

          season:
            req.query.season ||
            null,

          count: 0,

          leagues: [],

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

        season:
          req.query.season ||
          null,

        count: 0,

        leagues: [],

        source:
          "football-data.org",

        message:
          "Unable to load leagues",

        error:
          error.response?.data ||
          error.message,
      });
    }
  };