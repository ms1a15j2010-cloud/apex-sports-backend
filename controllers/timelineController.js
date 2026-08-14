const {
  getMatch,
} = require("../services/footballDataApi");

/* =====================================================
TIMELINE CONTROLLER

IMPORTANT:

This controller does NOT use:

services/footballApi.js

It uses the migrated:

services/footballDataApi.js

The timeline is built from real football-data.org match
data:

- goals
- bookings
- substitutions

No hard-coded or fake timeline events.
===================================================== */


/* =====================================================
BUILD TIMELINE
===================================================== */

function buildTimeline(match) {
  if (!match) {
    return [];
  }

  const timeline = [];

  /* =================================================
     GOALS
  ================================================= */

  const goals =
    Array.isArray(
      match.goals
    )
      ? match.goals
      : [];

  goals.forEach(
    (goal, index) => {
      timeline.push({
        id:
          `goal-${index}-${goal?.minute ?? 0}`,

        minute:
          goal?.minute ??
          0,

        extraTime:
          goal?.injuryTime ??
          0,

        type:
          "goal",

        team: {
          id:
            goal?.team?.id ??
            null,

          name:
            goal?.team?.name ||
            goal?.team?.shortName ||
            "Unknown Team",

          logo:
            goal?.team?.crest ||
            null,
        },

        player: {
          id:
            goal?.scorer?.id ??
            null,

          name:
            goal?.scorer?.name ||
            null,
        },

        assist: {
          id:
            goal?.assist?.id ??
            null,

          name:
            goal?.assist?.name ||
            null,
        },

        detail:
          goal?.type ||
          "Goal",

        description:
          goal?.type ||
          "Goal scored",
      });
    }
  );

  /* =================================================
     BOOKINGS
  ================================================= */

  const bookings =
    Array.isArray(
      match.bookings
    )
      ? match.bookings
      : [];

  bookings.forEach(
    (booking, index) => {
      timeline.push({
        id:
          `booking-${index}-${booking?.minute ?? 0}`,

        minute:
          booking?.minute ??
          0,

        extraTime:
          0,

        type:
          "yellow_card",

        card:
          booking?.card ||
          null,

        team: {
          id:
            booking?.team?.id ??
            null,

          name:
            booking?.team?.name ||
            booking?.team?.shortName ||
            "Unknown Team",

          logo:
            booking?.team?.crest ||
            null,
        },

        player: {
          id:
            booking?.player?.id ??
            null,

          name:
            booking?.player?.name ||
            null,
        },

        assist: null,

        detail:
          booking?.card ||
          "Card",

        description:
          booking?.card ||
          "Disciplinary card",
      });
    }
  );

  /* =================================================
     SUBSTITUTIONS
  ================================================= */

  const substitutions =
    Array.isArray(
      match.substitutions
    )
      ? match.substitutions
      : [];

  substitutions.forEach(
    (
      substitution,
      index
    ) => {
      timeline.push({
        id:
          `substitution-${index}-${substitution?.minute ?? 0}`,

        minute:
          substitution?.minute ??
          0,

        extraTime:
          0,

        type:
          "substitution",

        team: {
          id:
            substitution?.team?.id ??
            null,

          name:
            substitution?.team?.name ||
            substitution?.team?.shortName ||
            "Unknown Team",

          logo:
            substitution?.team?.crest ||
            null,
        },

        playerOut: {
          id:
            substitution?.playerOut?.id ??
            null,

          name:
            substitution?.playerOut?.name ||
            null,
        },

        playerIn: {
          id:
            substitution?.playerIn?.id ??
            null,

          name:
            substitution?.playerIn?.name ||
            null,
        },

        detail:
          "Substitution",

        description:
          "Player substitution",
      });
    }
  );

  /* =================================================
     SORT

     Oldest event first.
  ================================================= */

  timeline.sort(
    (a, b) => {
      const minuteA =
        Number(
          a?.minute || 0
        );

      const minuteB =
        Number(
          b?.minute || 0
        );

      if (
        minuteA !==
        minuteB
      ) {
        return (
          minuteA -
          minuteB
        );
      }

      const extraA =
        Number(
          a?.extraTime || 0
        );

      const extraB =
        Number(
          b?.extraTime || 0
        );

      return (
        extraA -
        extraB
      );
    }
  );

  return timeline;
}


/* =====================================================
GET MATCH TIMELINE

GET:

/api/match/:id/timeline
===================================================== */

exports.getTimeline =
  async (req, res) => {
    const fixtureId =
      req.params.id;

    try {
      if (!fixtureId) {
        return res.status(400).json({
          success: false,

          fixtureId: null,

          count: 0,

          timeline: [],

          source:
            "football-data.org",

          message:
            "Match ID is required",
        });
      }

      console.log(
        `⏱️ Loading match timeline from football-data.org | Match: ${fixtureId}`
      );

      /* =============================================
         LOAD FULL MATCH

         getMatch() already requests the unfolded event
         information.
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

          timeline: [],

          source:
            "football-data.org",

          message:
            "Match not found",
        });
      }

      /* =============================================
         BUILD REAL TIMELINE
      ============================================= */

      const timeline =
        buildTimeline(
          match
        );

      console.log(
        `✅ Timeline loaded: ${timeline.length} events`
      );

      return res.json({
        success: true,

        fixtureId:
          Number(fixtureId) ||
          fixtureId,

        count:
          timeline.length,

        timeline,

        source:
          "football-data.org",

        message:
          timeline.length > 0
            ? "Timeline loaded"
            : "No timeline events available",
      });
    } catch (error) {
      console.error(
        "❌ TimelineController football-data.org:",
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

          timeline: [],

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

        timeline: [],

        source:
          "football-data.org",

        message:
          "Unable to load timeline",

        error:
          error.response?.data ||
          error.message,
      });
    }
  };