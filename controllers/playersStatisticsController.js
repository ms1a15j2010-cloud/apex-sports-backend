const {
  getMatch,
} = require("../services/footballDataApi");

/* =====================================================
PLAYER STATISTICS / RATINGS

Provider:
football-data.org

IMPORTANT:

This controller no longer uses:

services/footballApi.js

Old API-Football endpoint:

/fixtures/players

football-data.org does not provide the same player-rating
statistics endpoint.

Instead, we use the real lineup/player information
returned by the match resource.

We NEVER generate fake ratings.
===================================================== */

/* =====================================================
NORMALIZE PLAYER
===================================================== */

function formatPlayer(
  player,
  team,
  starter = false
) {
  const data =
    player || {};

  return {
    player: {
      id:
        data.id ??
        null,

      name:
        data.name ||
        "Unknown Player",

      firstname:
        data.firstName ||
        null,

      lastname:
        data.lastName ||
        null,

      firstName:
        data.firstName ||
        null,

      lastName:
        data.lastName ||
        null,

      nationality:
        data.nationality ||
        null,

      position:
        data.position ||
        null,

      number:
        data.shirtNumber ??
        data.number ??
        null,

      photo:
        null,

      /* No fabricated rating */

      rating:
        null,
    },

    team: {
      id:
        team?.id ??
        null,

      name:
        team?.name ||
        team?.shortName ||
        "Unknown Team",

      shortName:
        team?.shortName ||
        null,

      tla:
        team?.tla ||
        null,

      logo:
        team?.crest ||
        null,
    },

    starter,

    /* Real provider data available at this level */

    statistics: {
      rating: null,

      minutes: null,

      goals: null,

      assists: null,

      shots: null,

      passes: null,

      tackles: null,

      duels: null,

      fouls: null,

      cards: {
        yellow: null,

        red: null,
      },
    },
  };
}

/* =====================================================
GET PLAYER STATISTICS
=====================================================

GET:

/api/match/:id/players
===================================================== */

exports.getPlayerStatistics =
  async (req, res) => {
    const fixtureId =
      req.params.id;

    try {
      if (!fixtureId) {
        return res.status(400).json({
          success: false,

          fixtureId: null,

          count: 0,

          players: [],

          message:
            "Match ID is required",
        });
      }

      console.log(
        `👤 Loading match players from football-data.org | Match: ${fixtureId}`
      );

      /* =============================================
         LOAD MATCH

         getMatch() should request the unfolded
         lineup data.
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

          players: [],

          message:
            "Match not found",
        });
      }

      /* =============================================
         GET LINEUPS
      ============================================= */

      const lineups =
        Array.isArray(
          match.lineups
        )
          ? match.lineups
          : [];

      const players = [];

      /* =============================================
         EXTRACT PLAYERS
      ============================================= */

      for (
        const lineup of lineups
      ) {
        const team =
          lineup?.team ||
          {};

        /* =========================================
           STARTING XI
        ========================================= */

        const startXI =
          Array.isArray(
            lineup?.startXI
          )
            ? lineup.startXI
            : [];

        for (
          const item of startXI
        ) {
          const player =
            item?.player ||
            item;

          if (!player) {
            continue;
          }

          players.push(
            formatPlayer(
              player,
              team,
              true
            )
          );
        }

        /* =========================================
           BENCH
        ========================================= */

        const substitutes =
          Array.isArray(
            lineup?.substitutes
          )
            ? lineup.substitutes
            : [];

        for (
          const item of substitutes
        ) {
          const player =
            item?.player ||
            item;

          if (!player) {
            continue;
          }

          players.push(
            formatPlayer(
              player,
              team,
              false
            )
          );
        }
      }

      /* =============================================
         REMOVE DUPLICATES
      ============================================= */

      const uniquePlayers =
        Array.from(
          new Map(
            players.map(
              (item, index) => [
                item.player?.id ??
                  `player-${index}`,
                item,
              ]
            )
          ).values()
        );

      console.log(
        `✅ Match players loaded: ${uniquePlayers.length}`
      );

      return res.json({
        success: true,

        fixtureId:
          Number(fixtureId) ||
          fixtureId,

        count:
          uniquePlayers.length,

        players:
          uniquePlayers,

        source:
          "football-data.org",

        ratingsAvailable:
          false,

        advancedStatisticsAvailable:
          false,

        message:
          uniquePlayers.length > 0
            ? "Match players loaded"
            : "No lineup player data available",
      });
    } catch (error) {
      console.error(
        "❌ PlayerStatisticsController:",
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

          count: 0,

          players: [],

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

        count: 0,

        players: [],

        source:
          "football-data.org",

        message:
          "Unable to load match players",

        error:
          error.response?.data ||
          error.message,
      });
    }
  };