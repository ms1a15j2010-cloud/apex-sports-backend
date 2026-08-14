const {
  getMatch,
} = require("../services/footballDataApi");

const formatEvent = require("../formatters/eventFormatter");

/* =====================================================
   MATCH EVENTS

   IMPORTANT:

   This controller now uses:

   services/footballDataApi.js

   It NO LONGER uses:

   services/footballApi.js

   Football-data.org provides match events through:

   goals
   bookings
   substitutions

   These are converted into the existing event format
   expected by the frontend.
===================================================== */

exports.getEvents = async (req, res) => {
  const fixtureId = req.params.id;

  try {
    if (!fixtureId) {
      return res.status(400).json({
        success: false,

        fixtureId: null,

        count: 0,

        events: [],

        message: "Match ID is required",
      });
    }

    /* =================================================
       GET FULL MATCH

       football-data.org:

       /matches/:id

       The service already requests:

       X-Unfold-Goals
       X-Unfold-Bookings
       X-Unfold-Subs
       ================================================= */

    const match =
      await getMatch(fixtureId);

    /* =================================================
       RAW PROVIDER DATA
       ================================================= */

    const goals =
      Array.isArray(
        match?.goals
      )
        ? match.goals
        : [];

    const bookings =
      Array.isArray(
        match?.bookings
      )
        ? match.bookings
        : [];

    const substitutions =
      Array.isArray(
        match?.substitutions
      )
        ? match.substitutions
        : [];

    /* =================================================
       NORMALIZED EVENTS
       ================================================= */

    const rawEvents = [];

    /* =================================================
       GOALS
       ================================================= */

    goals.forEach(
      (goal, index) => {
        rawEvents.push({
          id:
            `goal-${index}-${goal?.minute ?? 0}`,

          time: {
            elapsed:
              goal?.minute ?? 0,

            extra:
              goal?.injuryTime ?? 0,
          },

          team:
            goal?.team || {},

          player:
            goal?.scorer || {},

          assist:
            goal?.assist || {},

          type:
            "Goal",

          detail:
            goal?.type || "Normal Goal",

          comments:
            "",
        });
      }
    );

    /* =================================================
       BOOKINGS
       ================================================= */

    bookings.forEach(
      (booking, index) => {
        rawEvents.push({
          id:
            `booking-${index}-${booking?.minute ?? 0}`,

          time: {
            elapsed:
              booking?.minute ?? 0,

            extra: 0,
          },

          team:
            booking?.team || {},

          player:
            booking?.player || {},

          assist: {},

          type:
            "Card",

          detail:
            booking?.card || "",

          comments:
            "",
        });
      }
    );

    /* =================================================
       SUBSTITUTIONS
       ================================================= */

    substitutions.forEach(
      (substitution, index) => {
        rawEvents.push({
          id:
            `substitution-${index}-${substitution?.minute ?? 0}`,

          time: {
            elapsed:
              substitution?.minute ?? 0,

            extra: 0,
          },

          team:
            substitution?.team || {},

          player:
            substitution?.playerOut || {},

          assist:
            substitution?.playerIn || {},

          type:
            "subst",

          detail:
            "Substitution",

          comments:
            "",
        });
      }
    );

    /* =================================================
       FORMAT EVENTS

       Existing eventFormatter is retained so the
       frontend event structure does not change.
       ================================================= */

    const events =
      rawEvents.map(
        formatEvent
      );

    /* =================================================
       SORT EVENTS

       Oldest event first.
       ================================================= */

    events.sort(
      (a, b) => {
        const minuteA =
          Number(
            a?.time?.elapsed || 0
          );

        const minuteB =
          Number(
            b?.time?.elapsed || 0
          );

        const extraA =
          Number(
            a?.time?.extra || 0
          );

        const extraB =
          Number(
            b?.time?.extra || 0
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

        return (
          extraA -
          extraB
        );
      }
    );

    /* =================================================
       RESPONSE
       ================================================= */

    return res.json({
      success: true,

      fixtureId,

      count:
        events.length,

      events,

      message:
        "Events loaded from football-data.org",
    });

  } catch (err) {
    console.error(
      "EventsController:",
      err.response?.data ||
        err.message
    );

    return res.status(500).json({
      success: false,

      fixtureId,

      count: 0,

      events: [],

      message:
        "Unable to load events",
    });
  }
};