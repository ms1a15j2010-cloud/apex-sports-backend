const {
  getLiveMatches: getFootballDataLiveMatches,
} = require("../services/footballDataApi");

/* =====================================================
LIVE CONTROLLER

Provider:
football-data.org

Endpoint:
GET /api/live
===================================================== */

function formatLiveMatch(match) {
  if (!match) {
    return null;
  }

  const homeTeam =
    match.homeTeam || {};

  const awayTeam =
    match.awayTeam || {};

  const status =
    match.status || "IN_PLAY";

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

      venue: {
        name:
          match.venue ||
          "Venue TBD",

        city:
          match.city ||
          match.area?.name ||
          "City TBD",
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

      season:
        match.season?.startDate
          ? Number(
              String(
                match.season.startDate
              ).substring(0, 4)
            )
          : null,
    },

    home: {
      id:
        homeTeam.id ?? null,

      name:
        homeTeam.name ||
        homeTeam.shortName ||
        "Home Team",

      shortName:
        homeTeam.shortName ||
        null,

      tla:
        homeTeam.tla ||
        null,

      logo:
        homeTeam.crest ||
        null,
    },

    away: {
      id:
        awayTeam.id ?? null,

      name:
        awayTeam.name ||
        awayTeam.shortName ||
        "Away Team",

      shortName:
        awayTeam.shortName ||
        null,

      tla:
        awayTeam.tla ||
        null,

      logo:
        awayTeam.crest ||
        null,
    },

    teams: {
      home: {
        id:
          homeTeam.id ?? null,

        name:
          homeTeam.name ||
          homeTeam.shortName ||
          "Home Team",

        logo:
          homeTeam.crest ||
          null,
      },

      away: {
        id:
          awayTeam.id ?? null,

        name:
          awayTeam.name ||
          awayTeam.shortName ||
          "Away Team",

        logo:
          awayTeam.crest ||
          null,
      },
    },

    status: {
      short:
        status === "IN_PLAY"
          ? "LIVE"
          : status === "PAUSED"
          ? "HT"
          : status,

      long:
        status,

      elapsed:
        null,
    },

    goals: {
      home:
        match.score?.fullTime
          ?.home ?? null,

      away:
        match.score?.fullTime
          ?.away ?? null,
    },

    score: {
      home:
        match.score?.fullTime
          ?.home ?? null,

      away:
        match.score?.fullTime
          ?.away ?? null,

      halftime: {
        home:
          match.score?.halfTime
            ?.home ?? null,

        away:
          match.score?.halfTime
            ?.away ?? null,
      },
    },

    rawStatus:
      status,
  };
}

/* =====================================================
GET LIVE MATCHES
===================================================== */

exports.getLiveMatches =
  async (req, res) => {
    try {
      console.log(
        "🔴 Loading live matches from football-data.org..."
      );

      const rawMatches =
        await getFootballDataLiveMatches();

      const matches =
        Array.isArray(
          rawMatches
        )
          ? rawMatches
              .map(
                formatLiveMatch
              )
              .filter(Boolean)
          : [];

      console.log(
        `🔴 Football-data.org live matches received: ${matches.length}`
      );

      return res.json({
        success: true,

        leagueId:
          req.query.league ||
          null,

        season:
          req.query.season ||
          null,

        count:
          matches.length,

        matches,

        source:
          "football-data.org",

        message:
          matches.length > 0
            ? "Live matches loaded"
            : "No live matches available",
      });
    } catch (error) {
      console.error(
        "❌ LiveController:",
        error.response?.data ||
          error.message
      );

      if (
        error.response?.status ===
        429
      ) {
        return res.status(
          503
        ).json({
          success: false,

          leagueId:
            req.query.league ||
            null,

          season:
            req.query.season ||
            null,

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

      return res.status(
        500
      ).json({
        success: false,

        leagueId:
          req.query.league ||
          null,

        season:
          req.query.season ||
          null,

        count: 0,

        matches: [],

        source:
          "football-data.org",

        message:
          "Unable to load live matches",

        error:
          error.response?.data ||
          error.message,
      });
    }
  };