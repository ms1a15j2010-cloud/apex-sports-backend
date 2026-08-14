const {
  getMatch,
} = require("../services/footballDataApi");

/* =====================================================
MATCH LINEUPS CONTROLLER

IMPORTANT:

This controller NO LONGER uses:

services/footballApi.js

It now uses:

services/footballDataApi.js

The migrated getMatch() requests:

X-Unfold-Lineups: true

and returns lineup information when the provider makes
it available.

No fake lineup data is generated.
===================================================== */


/* =====================================================
FORMAT PLAYER
===================================================== */

function formatPlayer(
  player,
  team,
  starter = false
) {
  if (!player) {
    return null;
  }

  return {
    player: {
      id:
        player.id ??
        null,

      name:
        player.name ||
        "Unknown Player",

      firstName:
        player.firstName ||
        null,

      lastName:
        player.lastName ||
        null,

      nationality:
        player.nationality ||
        null,

      position:
        player.position ||
        null,

      number:
        player.shirtNumber ??
        player.number ??
        null,

      photo:
        null,

      /* No invented rating */

      rating:
        null,
    },

    starter,

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
  };
}


/* =====================================================
FORMAT LINEUP

Converts football-data.org lineup structure into the
structure expected by the existing Apex Sports frontend.
===================================================== */

function formatLineup(
  lineup
) {
  if (!lineup) {
    return null;
  }

  const team =
    lineup.team ||
    {};

  /* =================================================
  STARTING XI

  football-data.org may provide:

  startingXI

  depending on the returned unfolded structure.

  We also support:

  startXI

  for compatibility.
  ================================================= */

  const startingPlayers =
    Array.isArray(
      lineup.startingXI
    )
      ? lineup.startingXI
      : Array.isArray(
          lineup.startXI
        )
        ? lineup.startXI
        : [];

  const startXI =
    startingPlayers
      .map(
        (entry) => {
          const player =
            entry?.player ||
            entry;

          return formatPlayer(
            player,
            team,
            true
          );
        }
      )
      .filter(Boolean);

  /* =================================================
  SUBSTITUTES
  ================================================= */

  const substitutePlayers =
    Array.isArray(
      lineup.substitutes
    )
      ? lineup.substitutes
      : [];

  const substitutes =
    substitutePlayers
      .map(
        (entry) => {
          const player =
            entry?.player ||
            entry;

          return formatPlayer(
            player,
            team,
            false
          );
        }
      )
      .filter(Boolean);

  /* =================================================
  COACH

  Keep it compatible with the old frontend where
  possible.
  ================================================= */

  const coach =
    lineup.coach
      ? {
          id:
            lineup.coach.id ??
            null,

          name:
            lineup.coach.name ||
            null,
        }
      : null;

  return {
    team: {
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
    },

    coach,

    formation:
      lineup.formation ||
      null,

    startXI,

    /* Keep both names for frontend compatibility */

    startingXI:
      startXI,

    substitutes,

    bench:
      substitutes,

    source:
      "football-data.org",
  };
}


/* =====================================================
GET MATCH LINEUPS

GET:

/api/match/:id/lineups
===================================================== */

exports.getLineups =
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

          count: 0,

          lineups: [],

          message:
            "Match ID is required",
        });
      }

      console.log(
        `👥 Loading match lineups from football-data.org | Match: ${fixtureId}`
      );

      /* =============================================
         LOAD FULL MATCH

         getMatch() already uses:

         X-Unfold-Lineups: true
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

          lineups: [],

          message:
            "Match not found",
        });
      }

      /* =============================================
         RAW LINEUPS
      ============================================= */

      const rawLineups =
        Array.isArray(
          match.lineups
        )
          ? match.lineups
          : [];

      /* =============================================
         FORMAT
      ============================================= */

      const lineups =
        rawLineups
          .map(formatLineup)
          .filter(Boolean);

      console.log(
        `✅ Match lineups loaded: ${lineups.length}`
      );

      /* =============================================
         RESPONSE
      ============================================= */

      return res.json({
        success: true,

        fixtureId:
          Number(fixtureId) ||
          fixtureId,

        count:
          lineups.length,

        lineups,

        source:
          "football-data.org",

        message:
          lineups.length > 0
            ? "Lineups loaded"
            : "No lineup data available",
      });
    } catch (error) {
      console.error(
        "❌ LineupsController football-data.org:",
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

          lineups: [],

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

        lineups: [],

        source:
          "football-data.org",

        message:
          "Unable to load lineups",

        error:
          error.response?.data ||
          error.message,
      });
    }
  };