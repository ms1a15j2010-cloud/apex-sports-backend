const {
  getLiveMatches,
  getPremierLeagueMatches,
} = require("../services/footballDataApi");

/* =====================================================
FEATURED MATCH CONTROLLER

IMPORTANT:

This controller NO LONGER uses:

services/footballApi.js

It now uses:

services/footballDataApi.js

Priority:

1. Live Premier League match
2. Next scheduled Premier League match
3. No match

No fake/demo match is returned.

football-data.org supports competition match filtering
by dateFrom/dateTo/status/season. The existing service
also caches these requests for 5 minutes.
===================================================== */


/* =====================================================
FORMAT MATCH

Convert football-data.org match data into the structure
expected by the existing Apex Sports frontend.
===================================================== */

function formatFeaturedMatch(match) {
  if (!match) {
    return null;
  }

  const home =
    match.homeTeam || {};

  const away =
    match.awayTeam || {};

  const fullTime =
    match.score?.fullTime || {};

  const halfTime =
    match.score?.halfTime || {};

  let statusShort =
    match.status || "TBD";

  switch (match.status) {
    case "SCHEDULED":
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
        match.status || "TBD";
  }

  const season =
    match.season?.startDate
      ? Number(
          String(
            match.season.startDate
          ).substring(0, 4)
        )
      : null;

  return {
    id:
      match.id ?? null,

    fixture: {
      id:
        match.id ?? null,

      date:
        match.utcDate || null,

      timestamp:
        match.utcDate
          ? Math.floor(
              new Date(
                match.utcDate
              ).getTime() / 1000
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
        match.competition?.id ??
        2021,

      name:
        match.competition?.name ||
        "Premier League",

      code:
        match.competition?.code ||
        "PL",

      country:
        match.area?.name ||
        "England",

      logo:
        match.competition?.emblem ||
        "https://crests.football-data.org/PL.png",

      flag:
        match.area?.flag ||
        null,

      season,
    },

    home: {
      id:
        home.id ?? null,

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
        match.score?.winner === "HOME"
          ? true
          : match.score?.winner === "AWAY"
            ? false
            : null,
    },

    away: {
      id:
        away.id ?? null,

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
        match.score?.winner === "AWAY"
          ? true
          : match.score?.winner === "HOME"
            ? false
            : null,
    },

    teams: {
      home: {
        id:
          home.id ?? null,

        name:
          home.name ||
          home.shortName ||
          "Home Team",

        logo:
          home.crest ||
          null,

        winner:
          match.score?.winner === "HOME"
            ? true
            : match.score?.winner === "AWAY"
              ? false
              : null,
      },

      away: {
        id:
          away.id ?? null,

        name:
          away.name ||
          away.shortName ||
          "Away Team",

        logo:
          away.crest ||
          null,

        winner:
          match.score?.winner === "AWAY"
            ? true
            : match.score?.winner === "HOME"
              ? false
              : null,
      },
    },

    goals: {
      home:
        fullTime.home ?? null,

      away:
        fullTime.away ?? null,
    },

    score: {
      winner:
        match.score?.winner ??
        null,

      duration:
        match.score?.duration ||
        "REGULAR",

      home:
        fullTime.home ?? null,

      away:
        fullTime.away ?? null,

      halftime: {
        home:
          halfTime.home ?? null,

        away:
          halfTime.away ?? null,
      },

      fulltime: {
        home:
          fullTime.home ?? null,

        away:
          fullTime.away ?? null,
      },
    },

    status: {
      short:
        statusShort,

      long:
        match.status ||
        "Unknown",

      elapsed:
        match.minute ??
        null,

      injuryTime:
        match.injuryTime ??
        null,
    },

    competition:
      match.competition || null,

    seasonData:
      match.season || null,

    rawStatus:
      match.status || null,
  };
}


/* =====================================================
GET CURRENT PAKISTAN DATE
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
GET FEATURED MATCH
=====================================================

GET:

/api/featured-match

Priority:

LIVE MATCH
↓
NEXT SCHEDULED MATCH
↓
NO MATCH
===================================================== */

exports.getFeaturedMatch =
  async (req, res) => {
    try {
      console.log(
        "⭐ Loading featured Premier League match from football-data.org..."
      );

      /* =============================================
         1. LIVE MATCHES
      ============================================= */

      const liveMatches =
        await getLiveMatches();

      const premierLeagueLive =
        Array.isArray(liveMatches)
          ? liveMatches
              .filter(
                (match) =>
                  match?.competition
                    ?.code === "PL"
              )
              .sort(
                (a, b) => {
                  const dateA =
                    new Date(
                      a?.utcDate || 0
                    ).getTime();

                  const dateB =
                    new Date(
                      b?.utcDate || 0
                    ).getTime();

                  return dateA - dateB;
                }
              )
          : [];

      if (
        premierLeagueLive.length >
        0
      ) {
        const featured =
          formatFeaturedMatch(
            premierLeagueLive[0]
          );

        console.log(
          `🔴 Featured live match: ${featured?.home?.name} vs ${featured?.away?.name}`
        );

        return res.json({
          success: true,

          featuredType:
            "live",

          match:
            featured,

          source:
            "football-data.org",

          message:
            "Live featured match loaded",
        });
      }

      /* =============================================
         2. NEXT SCHEDULED MATCH
      ============================================= */

      const today =
        getPakistanDate();

      /*
       * dateTo is exclusive in football-data.org.
       * We therefore search a practical 14-day window.
       */
      const futureDate =
        new Date(
          `${today}T00:00:00`
        );

      futureDate.setDate(
        futureDate.getDate() + 14
      );

      const dateTo =
        futureDate
          .toISOString()
          .slice(0, 10);

      const upcomingData =
        await getPremierLeagueMatches({
          dateFrom:
            today,

          dateTo,

          status:
            "SCHEDULED",

          limit: 20,
        });

      const upcomingMatches =
        Array.isArray(
          upcomingData?.matches
        )
          ? upcomingData.matches
          : [];

      const scheduledMatches =
        upcomingMatches
          .filter(
            (match) =>
              match?.status ===
                "SCHEDULED" ||
              match?.status ===
                "TIMED"
          )
          .sort(
            (a, b) => {
              const dateA =
                new Date(
                  a?.utcDate || 0
                ).getTime();

              const dateB =
                new Date(
                  b?.utcDate || 0
                ).getTime();

              return (
                dateA - dateB
              );
            }
          );

      if (
        scheduledMatches.length >
        0
      ) {
        const featured =
          formatFeaturedMatch(
            scheduledMatches[0]
          );

        console.log(
          `📅 Featured upcoming match: ${featured?.home?.name} vs ${featured?.away?.name}`
        );

        return res.json({
          success: true,

          featuredType:
            "upcoming",

          match:
            featured,

          source:
            "football-data.org",

          message:
            "Upcoming featured match loaded",
        });
      }

      /* =============================================
         3. NO MATCH
      ============================================= */

      console.log(
        "🟡 No Premier League featured match available"
      );

      return res.json({
        success: false,

        featuredType:
          null,

        match: null,

        source:
          "football-data.org",

        message:
          "No featured match available",
      });
    } catch (error) {
      console.error(
        "❌ FeaturedMatchController football-data.org:",
        error.response?.data ||
          error.message
      );

      if (
        error.response?.status ===
        429
      ) {
        return res.status(503).json({
          success: false,

          featuredType:
            null,

          match: null,

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

        featuredType:
          null,

        match: null,

        source:
          "football-data.org",

        message:
          "Unable to load featured match",

        error:
          error.response?.data ||
          error.message,
      });
    }
  };