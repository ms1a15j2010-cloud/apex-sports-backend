const { apiGet } = require("../services/footballApi");

const formatEvent = require("../formatters/eventFormatter");

/* =====================================================
   MATCH EVENTS
===================================================== */

exports.getEvents = async (req, res) => {
  try {
    const fixtureId = req.params.id;

    const response = await apiGet("/fixtures/events", {
      fixture: fixtureId,
    });

    const events = Array.isArray(response)
      ? response.map(formatEvent)
      : [];

    return res.json({
      success: true,

      fixtureId,

      count: events.length,

      events,

      message: "Events loaded",
    });

  } catch (err) {
    console.error("EventsController:", err.message);

    return res.status(500).json({
      success: false,

      fixtureId: req.params.id,

      count: 0,

      events: [],

      message: "Unable to load events",
    });
  }
};