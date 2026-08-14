// controllers/standingsMiniController.js

const {
  footballDataGet,
} = require("../services/footballDataApi");

/* =====================================================
LEAGUE MAPPING
===================================================== */

const LEAGUE_MAP = {
  epl: "PL",
};

/* =====================================================
GET MINI STANDINGS

Example:

/api/standings/mini/epl

Optional:

/api/standings/mini/epl?season=2025
===================================================== */

exports.getStandingsMini = async (
  req,
  res
) => {
  try {
    const leagueSlug =
      String(
        req.params.id ||
          req.query.league ||
          "epl"
      ).toLowerCase();

    const competitionCode =
      LEAGUE_MAP[
        leagueSlug
      ];

    /* -------------------------------------------------
    CHECK LEAGUE
    ------------------------------------------------- */

    if (!competitionCode) {
      return res
        .status(404)
        .json({
          success: false,
          count: 0,
          standings: [],
          message:
            `Unsupported league: ${leagueSlug}`,
        });
    }

    /* -------------------------------------------------
    SEASON
    ------------------------------------------------- */

    const season =
      Number(
        req.query.season
      ) || 2025;

    console.log(
      `📊 Loading mini standings | ${leagueSlug} | Season ${season}`
    );

    /* -------------------------------------------------
    FOOTBALL-DATA.ORG
    ------------------------------------------------- */

    const data =
      await footballDataGet(
        `/competitions/${competitionCode}/standings`,
        {
          season,
        }
      );

    /* -------------------------------------------------
    VALIDATE
    ------------------------------------------------- */

    if (
      !data ||
      !Array.isArray(
        data.standings
      ) ||
      data.standings.length === 0
    ) {
      console.warn(
        `⚠️ No standings found | ${competitionCode} | ${season}`
      );

      return res.json({
        success: false,
        count: 0,
        standings: [],
        message:
          "No standings found",
      });
    }

    /* -------------------------------------------------
    FIND TOTAL TABLE
    ------------------------------------------------- */

    const totalTable =
      data.standings.find(
        (table) =>
          table.type === "TOTAL"
      ) ||
      data.standings[0];

    const table =
      Array.isArray(
        totalTable?.table
      )
        ? totalTable.table
        : [];

    /* -------------------------------------------------
    MINI TABLE

    TOP 5
    ------------------------------------------------- */

    const standings =
      table
        .slice(0, 5)
        .map((club) => ({
          rank:
            club.position,

          points:
            club.points,

          team: {
            id:
              club.team?.id,

            name:
              club.team?.name,

            logo:
              club.team?.crest ||
              null,
          },

          played:
            club.playedGames,

          won:
            club.won,

          draw:
            club.draw,

          lost:
            club.lost,

          goalsFor:
            club.goalsFor,

          goalsAgainst:
            club.goalsAgainst,

          goalDifference:
            club.goalDifference,

          form:
            club.form ||
            null,
        }));

    /* -------------------------------------------------
    RESPONSE
    ------------------------------------------------- */

    console.log(
      `✅ Mini standings loaded | ${standings.length} teams`
    );

    return res.json({
      success: true,

      league: {
        id:
          competitionCode,

        name:
          data.competition?.name ||
          "Premier League",

        season,
      },

      count:
        standings.length,

      standings,
    });
  } catch (error) {
    console.error(
      "❌ StandingsMiniController:",
      error.response?.data ||
        error.message
    );

    return res
      .status(
        error.response?.status ||
          500
      )
      .json({
        success: false,

        count: 0,

        standings: [],

        message:
          "Unable to load standings",
      });
  }
};