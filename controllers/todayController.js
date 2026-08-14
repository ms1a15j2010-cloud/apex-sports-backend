const {
  getPremierLeagueMatches,
} = require("../services/footballDataApi");

/* =====================================================
TODAY MATCHES CONTROLLER

IMPORTANT:

This controller NO LONGER uses:

services/footballApi.js

It now uses:

services/footballDataApi.js

football-data.org supports dateFrom/dateTo on the
competition matches endpoint.

Apex Sports keeps the existing response shape:

{
  success,
  date,
  count,
  matches
}

No fake matches are generated.
===================================================== */


/* =====================================================
GET PAKISTAN DATE

If the frontend does not provide ?date=YYYY-MM-DD,
use the current calendar date in Pakistan.

Examples:

2026-08-13
2026-08-14
===================================================== */

function getPakistanDate() {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone:
        "Asia/Karachi",

      year: "numeric",

      month: "2-digit",

      day: "2-digit",
    }
  ).format(new Date());
}


/* =====================================================
VALIDATE DATE

Expected:

YYYY-MM-DD
===================================================== */

function isValidDate(
  value
) {
  if (
    typeof value !==
    "string"
  ) {
    return false;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(
    value
  );
}


/* =====================================================
FORMAT FOOTBALL-DATA MATCH

Converts football-data.org format into the structure
already used throughout Apex Sports.

Provider:

football-data.org

Source:

competition matches
===================================================== */

function formatTodayMatch(
  match
) {
  if (!match) {
    return null;
  }

  const home =
    match.homeTeam ||
    {};

  const away =
    match.awayTeam ||
    {};

  const fullTime =
    match.score?.fullTime ||
    {};

  const halfTime =
    match.score?.halfTime ||
    {};

  /* =============================================
     STATUS
  ============================================= */

  let statusShort =
    match.status ||
    "TBD";

  switch (
    match.status
  ) {
    case "SCHEDULED":
      statusShort = "NS";
      break;

    case "TIMED":
      statusShort = "NS";
      break;

    case "IN_PLAY":
      statusShort = "LIVE";
      break;

    case "PAUSED":
      statusShort = "HT";
      break;

    case "FINISHED":
      statusShort = "FT";
      break;

    case "POSTPONED":
      statusShort = "PST";
      break;

    case "SUSPENDED":
      statusShort = "SUS";
      break;

    case "CANCELLED":
      statusShort = "CANC";
      break;

    default:
      statusShort =
        match.status ||
        "TBD";
  }

  /* =============================================
     SEASON
  ============================================= */

  const season =
    match.season?.startDate
      ? Number(
          String(
            match.season.startDate
          ).substring(
            0,
            4
          )
        )
      : null;

  /* =============================================
     RETURN APEX FORMAT
  ============================================= */

  return {
    id:
      match.id ??
      null,

    fixture: {
      id:
        match.id ??
        null,

      date:
        match.utcDate ||
        null,

      timestamp:
        match.utcDate
          ? Math.floor(
              new Date(
                match.utcDate
              ).getTime() /
                1000
            )
          : null,

      timezone:
        "UTC",

      venue: {
        name:
          match.venue ||
          "Venue TBD",

        city:
          match.area?.name ||
          "England",
      },
    },

    league: {
      id:
        match.competition
          ?.id ??
        2021,

      name:
        match.competition
          ?.name ||
        "Premier League",

      code:
        match.competition
          ?.code ||
        "PL",

      country:
        match.area?.name ||
        "England",

      logo:
        match.competition
          ?.emblem ||
        "https://crests.football-data.org/PL.png",

      flag:
        match.area?.flag ||
        null,

      season,
    },

    home: {
      id:
        home.id ??
        null,

      name:
        home.name ||
        home.shortName ||
        "Home Team",

      shortName:
        home.shortName ||
        null,

      tla:
        home.tla ||
        null,

      logo:
        home.crest ||
        null,

      winner:
        match.score
          ?.winner ===
        "HOME"
          ? true
          : match.score
              ?.winner ===
            "AWAY"
          ? false
          : null,
    },

    away: {
      id:
        away.id ??
        null,

      name:
        away.name ||
        away.shortName ||
        "Away Team",

      shortName:
        away.shortName ||
        null,

      tla:
        away.tla ||
        null,

      logo:
        away.crest ||
        null,

      winner:
        match.score
          ?.winner ===
        "AWAY"
          ? true
          : match.score
              ?.winner ===
            "HOME"
          ? false
          : null,
    },

    teams: {
      home: {
        id:
          home.id ??
          null,

        name:
          home.name ||
          home.shortName ||
          "Home Team",

        logo:
          home.crest ||
          null,

        winner:
          match.score
            ?.winner ===
          "HOME"
            ? true
            : match.score
                ?.winner ===
              "AWAY"
            ? false
            : null,
      },

      away: {
        id:
          away.id ??
          null,

        name:
          away.name ||
          away.shortName ||
          "Away Team",

        logo:
          away.crest ||
          null,

        winner:
          match.score
            ?.winner ===
          "AWAY"
            ? true
            : match.score
                ?.winner ===
              "HOME"
            ? false
            : null,
      },
    },

    status: {
      short:
        statusShort,

      long:
        match.status ||
        "Unknown",

      elapsed:
        null,
    },

    score: {
      home:
        fullTime.home ??
        null,

      away:
        fullTime.away ??
        null,

      halftime: {
        home:
          halfTime.home ??
          null,

        away:
          halfTime.away ??
          null,
      },

      fulltime: {
        home:
          fullTime.home ??
          null,

        away:
          fullTime.away ??
          null,
      },
    },

    competition:
      match.competition ||
      null,

    seasonData:
      match.season ||
      null,

    rawStatus:
      match.status ||
      null,
  };
}


/* =====================================================
GET TODAY MATCHES

Existing frontend endpoint:

/api/today

Optional:

/api/today?date=2026-08-13

Optional league:

/api/today?league=PL

Optional season:

/api/today?season=2026

===================================================== */

exports.getTodayMatches =
  async (
    req,
    res
  ) => {
    try {
      /* =============================================
         DATE
      ============================================= */

      const requestedDate =
        req.query.date ||
        getPakistanDate();

      if (
        !isValidDate(
          requestedDate
        )
      ) {
        return res.status(400).json({
          success: false,

          date:
            requestedDate,

          count: 0,

          matches: [],

          source:
            "football-data.org",

          message:
            "Invalid date. Expected YYYY-MM-DD",
        });
      }

      /* =============================================
         LEAGUE

         Current migrated implementation is PL because
         getPremierLeagueMatches() is our migrated
         competition service.
      ============================================= */

      const league =
        String(
          req.query.league ||
            "PL"
        )
          .trim()
          .toUpperCase();

      if (
        league !== "PL"
      ) {
        return res.status(400).json({
          success: false,

          date:
            requestedDate,

          league,

          count: 0,

          matches: [],

          source:
            "football-data.org",

          message:
            "Today matches currently support Premier League (PL) only",
        });
      }

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
          : null;

      console.log(
        `📅 Loading today's matches | Date: ${requestedDate} | League: PL${
          season
            ? ` | Season: ${season}`
            : ""
        }`
      );

      /* =============================================
         FOOTBALL-DATA.ORG DATE RANGE

         dateFrom/dateTo allow us to request the whole
         requested calendar day.

         The provider returns UTC timestamps while the
         requested date is the calendar date.
      ============================================= */

      const params = {
        dateFrom:
          requestedDate,

        dateTo:
          requestedDate,
      };

      if (
        season
      ) {
        params.season =
          season;
      }

      /* =============================================
         LOAD MATCHES

         getPremierLeagueMatches() is already cached.
      ============================================= */

      const data =
        await getPremierLeagueMatches(
          params
        );

      const rawMatches =
        Array.isArray(
          data?.matches
        )
          ? data.matches
          : [];

      console.log(
        `⚽ football-data.org today matches received: ${rawMatches.length}`
      );

      /* =============================================
         FORMAT
      ============================================= */

      const matches =
        rawMatches
          .map(
            formatTodayMatch
          )
          .filter(Boolean);

      /* =============================================
         EMPTY STATE
      ============================================= */

      if (
        matches.length === 0
      ) {
        return res.json({
          success: true,

          date:
            requestedDate,

          league: {
            id:
              2021,

            name:
              "Premier League",

            code:
              "PL",

            country:
              "England",

            logo:
              "https://crests.football-data.org/PL.png",

            season:
              season,
          },

          season,

          count: 0,

          matches: [],

          source:
            "football-data.org",

          message:
            "No matches scheduled for this date",
        });
      }

      /* =============================================
         RESPONSE
      ============================================= */

      console.log(
        `✅ Today's matches loaded: ${matches.length}`
      );

      return res.json({
        success: true,

        date:
          requestedDate,

        league: {
          id:
            2021,

          name:
            "Premier League",

          code:
            "PL",

          country:
            "England",

          logo:
            "https://crests.football-data.org/PL.png",

          season:
            season,
        },

        season,

        count:
          matches.length,

        matches,

        source:
          "football-data.org",

        message:
          "Today's matches loaded",
      });
    } catch (error) {
      console.error(
        "❌ TodayController football-data.org:",
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

          date:
            req.query.date ||
            getPakistanDate(),

          count: 0,

          matches: [],

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

        date:
          req.query.date ||
          getPakistanDate(),

        count: 0,

        matches: [],

        source:
          "football-data.org",

        message:
          "Unable to load today's matches",

        error:
          error.response?.data ||
          error.message,
      });
    }
  };