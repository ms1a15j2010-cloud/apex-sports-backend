const {
  getMatch,
} = require(
  "../services/footballDataApi"
);

/* =====================================================
MATCH CONTROLLER

Provider:
football-data.org

IMPORTANT:

This controller no longer imports:

services/footballApi.js

The old API-Football fixture endpoints are not used.

Supported from the migrated provider:

- Match information
- Teams
- Competition
- Season
- Score
- Goals
- Match status
- Lineups, when available
- Bench, when available
- Substitutions/bookings, when returned
===================================================== */

/* =====================================================
NORMALIZE MATCH

Converts football-data.org match data into a structure
that is compatible with the existing Apex Sports
Match Center components as much as possible.
===================================================== */

function formatMatch(match) {
  if (!match) {
    return null;
  }

  const homeTeam =
    match.homeTeam || {};

  const awayTeam =
    match.awayTeam || {};

  const competition =
    match.competition || {};

  const season =
    match.season || {};

  const area =
    match.area || {};

  const fullTime =
    match.score?.fullTime ||
    {};

  const halfTime =
    match.score?.halfTime ||
    {};

  /* =================================================
  STATUS
  ================================================= */

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

    case "EXTRA_TIME":
      statusShort = "ET";
      break;

    case "PENALTY_SHOOTOUT":
      statusShort = "PEN";
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

    case "AWARDED":
      statusShort = "AWD";
      break;

    default:
      break;
  }

  /* =================================================
  SEASON YEAR
  ================================================= */

  const seasonYear =
    season?.startDate
      ? Number(
          String(
            season.startDate
          ).substring(0, 4)
        )
      : null;

  /* =================================================
  FORMAT GOALS / EVENTS

  football-data.org provides goal events in the
  match.goals array.
  ================================================= */

  const goals =
    Array.isArray(match.goals)
      ? match.goals
      : [];

  const events =
    goals.map(
      (goal, index) => ({
        id:
          `goal-${match.id}-${index}`,

        time: {
          elapsed:
            goal.minute ??
            null,

          extra:
            goal.injuryTime ??
            null,
        },

        team: {
          id:
            goal.team?.id ??
            null,

          name:
            goal.team?.name ||
            "Unknown Team",

          logo:
            goal.team?.crest ||
            null,
        },

        player: {
          id:
            goal.scorer?.id ??
            null,

          name:
            goal.scorer?.name ||
            null,
        },

        assist: {
          id:
            goal.assist?.id ??
            null,

          name:
            goal.assist?.name ||
            null,
        },

        type:
          goal.type ||
          "GOAL",

        detail:
          goal.type ||
          "GOAL",

        score: {
          home:
            goal.score?.home ??
            null,

          away:
            goal.score?.away ??
            null,
        },
      })
    );

  /* =================================================
  FORMAT LINEUPS

  football-data.org may expose lineups directly on
  the match resource depending on permissions/data.
  ================================================= */

  const rawLineups =
    Array.isArray(
      match.lineups
    )
      ? match.lineups
      : [];

  const lineups =
    rawLineups.map(
      (lineup) => ({
        team: {
          id:
            lineup.team?.id ??
            null,

          name:
            lineup.team?.name ||
            "Unknown Team",

          crest:
            lineup.team?.crest ||
            null,

          logo:
            lineup.team?.crest ||
            null,
        },

        coach:
          lineup.coach ||
          null,

        formation:
          lineup.formation ||
          null,

        startXI:
          Array.isArray(
            lineup.startXI
          )
            ? lineup.startXI
            : Array.isArray(
                lineup.lineup
              )
            ? lineup.lineup
            : [],

        substitutes:
          Array.isArray(
            lineup.substitutes
          )
            ? lineup.substitutes
            : Array.isArray(
                lineup.bench
              )
            ? lineup.bench
            : [],
      })
    );

  /* =================================================
  RETURN APEX SPORTS MATCH FORMAT
  ================================================= */

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
          match.city ||
          area.name ||
          null,
      },

      referee:
        Array.isArray(
          match.referees
        ) &&
        match.referees.length
          ? match.referees[0]
          : null,
    },

    league: {
      id:
        competition.id ??
        2021,

      name:
        competition.name ||
        "Premier League",

      code:
        competition.code ||
        "PL",

      country:
        area.name ||
        "England",

      logo:
        competition.emblem ||
        "https://crests.football-data.org/PL.png",

      flag:
        area.flag ||
        null,

      season:
        seasonYear,

      stage:
        match.stage ||
        null,

      group:
        match.group ||
        null,

      matchday:
        match.matchday ||
        null,
    },

    home: {
      id:
        homeTeam.id ??
        null,

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

      winner:
        match.score?.winner ===
        "HOME"
          ? true
          : match.score?.winner ===
            "AWAY"
          ? false
          : null,
    },

    away: {
      id:
        awayTeam.id ??
        null,

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

      winner:
        match.score?.winner ===
        "AWAY"
          ? true
          : match.score?.winner ===
            "HOME"
          ? false
          : null,
    },

    teams: {
      home: {
        id:
          homeTeam.id ??
          null,

        name:
          homeTeam.name ||
          homeTeam.shortName ||
          "Home Team",

        logo:
          homeTeam.crest ||
          null,

        winner:
          match.score?.winner ===
          "HOME"
            ? true
            : match.score?.winner ===
              "AWAY"
            ? false
            : null,
      },

      away: {
        id:
          awayTeam.id ??
          null,

        name:
          awayTeam.name ||
          awayTeam.shortName ||
          "Away Team",

        logo:
          awayTeam.crest ||
          null,

        winner:
          match.score?.winner ===
          "AWAY"
            ? true
            : match.score?.winner ===
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
        match.minute ??
        null,

      injuryTime:
        match.injuryTime ??
        null,
    },

    score: {
      winner:
        match.score?.winner ||
        null,

      duration:
        match.score?.duration ||
        "REGULAR",

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

      penalties: {
        home:
          match.score?.penalties
            ?.home ??
          null,

        away:
          match.score?.penalties
            ?.away ??
          null,
      },

      extraTime: {
        home:
          match.score?.extraTime
            ?.home ??
          null,

        away:
          match.score?.extraTime
            ?.away ??
          null,
      },
    },

    goals,

    events,

    lineups,

    /* =================================================
    API-Football compatibility placeholders

    These are intentionally empty because
    football-data.org does not expose equivalent
    fixture statistics / player-rating resources.
    ================================================= */

    statistics: [],

    players: [],

    headtohead: [],

    prediction: null,

    standings: [],

    /* =================================================
    PROVIDER DATA
    ================================================= */

    competition,

    season,

    area,

    raw: match,
  };
}

/* =====================================================
GET MATCH DETAILS

GET:

/api/match/:id
===================================================== */

exports.getMatch =
  async (req, res) => {
    try {
      const fixtureId =
        req.params.id;

      if (!fixtureId) {
        return res.status(400).json({
          success: false,

          message:
            "Match ID is required",

          match: null,
        });
      }

      console.log(
        `⚽ Loading match ${fixtureId} from football-data.org...`
      );

      const rawMatch =
        await getMatch(
          fixtureId
        );

      if (
        !rawMatch ||
        !rawMatch.id
      ) {
        return res.status(404).json({
          success: false,

          message:
            "Match not found",

          match: null,
        });
      }

      const match =
        formatMatch(
          rawMatch
        );

      console.log(
        `✅ Match ${fixtureId} loaded`
      );

      return res.json({
        success: true,

        match,

        statisticsCount:
          match.statistics
            .length,

        eventsCount:
          match.events.length,

        lineupsCount:
          match.lineups.length,

        playersCount:
          match.players.length,

        message:
          "Match loaded",
      });
    } catch (error) {
      console.error(
        "❌ MatchController:",
        error.response?.data ||
          error.message
      );

      if (
        error.response?.status ===
        404
      ) {
        return res.status(404).json({
          success: false,

          message:
            "Match not found",

          match: null,
        });
      }

      if (
        error.response?.status ===
        429
      ) {
        return res.status(503).json({
          success: false,

          message:
            "Football-data.org request limit reached. Please try again later.",

          match: null,

          apiLimitReached:
            true,
        });
      }

      return res.status(500).json({
        success: false,

        message:
          "Unable to load match",

        match: null,

        statisticsCount: 0,

        eventsCount: 0,

        lineupsCount: 0,

        playersCount: 0,

        error:
          error.response?.data ||
          error.message,
      });
    }
  };