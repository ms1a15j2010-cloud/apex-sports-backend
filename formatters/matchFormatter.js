module.exports = ({
  fixture,
  statistics = [],
  events = [],
  lineups = [],
  players = [],
  headToHead = [],
  prediction = null,
  standings = [],
}) => {
  if (!fixture) return null;

  return {
    /* =====================================
       BASIC
    ===================================== */

    id: fixture.fixture?.id,

    fixture:
      fixture.fixture || {},

    league:
      fixture.league || {},

    referee:
      fixture.fixture?.referee || "",

    timezone:
      fixture.fixture?.timezone || "",

    venue:
      fixture.fixture?.venue || {},

    status:
      fixture.fixture?.status || {},

    /* =====================================
       TEAMS
    ===================================== */

    home:
      fixture.teams?.home || {},

    away:
      fixture.teams?.away || {},

    goals:
      fixture.goals || {
        home: 0,
        away: 0,
      },

    score:
      fixture.score || {},

    /* =====================================
       MATCH DATA
    ===================================== */

    statistics,

    events,

    timeline: events,

    lineups,

    players,

    /* =====================================
       EXTRA MODULES
    ===================================== */

    playerRatings:
      players,

    facts: {
      referee:
        fixture.fixture?.referee || "",

      venue:
        fixture.fixture?.venue || {},

      attendance:
        fixture.fixture?.attendance || null,

      timezone:
        fixture.fixture?.timezone || "",
    },

    headToHead,

    standings,

    prediction,

    /* =====================================
       UI HELPERS
    ===================================== */

    isFinished:
      ["FT", "AET", "PEN"].includes(
        fixture.fixture?.status?.short
      ),

    isLive:
      fixture.fixture?.status?.short ===
      "LIVE",

    isUpcoming:
      fixture.fixture?.status?.short ===
      "NS",
  };
};