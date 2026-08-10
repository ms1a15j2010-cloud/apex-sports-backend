const { apiGet } = require("../services/footballApi");

const formatFixture = require("../formatters/fixtureFormatter");

/* =====================================================
   LIVE FIXTURE STATUSES
===================================================== */

const LIVE_STATUSES =
  "1H-HT-2H-ET-BT-P-SUSP-INT-LIVE";

/* =====================================================
   PAKISTAN DATE
===================================================== */

function getPakistanDate() {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Karachi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(new Date());
}

/* =====================================================
   LIVE MATCHES
===================================================== */

exports.getLiveMatches = async (
  req,
  res
) => {
  const leagueId =
    req.query.league || null;

  const season =
    req.query.season || null;

  try {
    console.log(
      "🔴 Loading live matches..."
    );

    /* ==========================================
       PRIMARY REQUEST
    ========================================== */

    const liveParams = {
      live: "all",
    };

    if (leagueId) {
      liveParams.league =
        leagueId;
    }

    if (season) {
      liveParams.season =
        season;
    }

    console.log(
      "Live params:",
      liveParams
    );

    let response =
      await apiGet(
        "/fixtures",
        liveParams
      );

    let source =
      "live=all";

    /* ==========================================
       FALLBACK REQUEST
       
       If live=all returns nothing,
       check today's fixtures using
       every known in-play status.
    ========================================== */

    if (
      !Array.isArray(response) ||
      response.length === 0
    ) {
      const today =
        getPakistanDate();

      const fallbackParams = {
        date: today,
        status: LIVE_STATUSES,
        timezone:
          "Asia/Karachi",
      };

      if (leagueId) {
        fallbackParams.league =
          leagueId;
      }

      if (season) {
        fallbackParams.season =
          season;
      }

      console.log(
        "🟡 Live fallback params:",
        fallbackParams
      );

      const fallbackResponse =
        await apiGet(
          "/fixtures",
          fallbackParams
        );

      if (
        Array.isArray(
          fallbackResponse
        )
      ) {
        response =
          fallbackResponse;

        source =
          "today+live-status";
      }
    }

    /* ==========================================
       FORMAT MATCHES
    ========================================== */

    const matches =
      Array.isArray(response)
        ? response
            .map(formatFixture)
            .filter(
              (match) =>
                match?.fixture?.id
            )
        : [];

    console.log(
      `🔴 Live fixtures received: ${matches.length}`
    );

    /* ==========================================
       RESPONSE
    ========================================== */

    return res.json({
      success: true,

      leagueId,

      season,

      count:
        matches.length,

      matches,

      source,

      message:
        matches.length > 0
          ? "Live matches loaded"
          : "No live matches available",
    });

  } catch (err) {
    console.error(
      "LiveController:",
      err.message
    );

    return res.status(500).json({
      success: false,

      leagueId,

      season,

      count: 0,

      matches: [],

      source: null,

      message:
        "Unable to load live matches",
    });
  }
};