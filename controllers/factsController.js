const {
  getMatch,
  getHeadToHead,
} = require("../services/footballDataApi");

/* =====================================================
MATCH FACTS CONTROLLER

IMPORTANT:

This controller does NOT use:

services/footballApi.js

It uses the migrated football-data.org service.

Facts are calculated from real match + H2H data.

No hard-coded/fake facts.
===================================================== */


/* =====================================================
FORMAT DATE
===================================================== */

function formatMatchDate(
  date
) {
  if (!date) {
    return null;
  }

  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return null;
  }

  return parsed.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",

      month: "short",

      year: "numeric",
    }
  );
}


/* =====================================================
BUILD MATCH FACTS
===================================================== */

function buildFacts(
  match,
  h2hMatches,
  currentHomeId,
  currentAwayId
) {
  const matches =
    Array.isArray(
      h2hMatches
    )
      ? h2hMatches
      : [];

  /* =============================================
     DEFAULT VALUES
  ============================================= */

  const facts = {
    highestScoringTeam:
      null,

    highestScoringGoals:
      0,

    biggestWin:
      null,

    biggestWinMargin:
      0,

    totalGoals:
      0,

    cleanSheets: {
      home: 0,

      away: 0,
    },

    averageGoals:
      0,

    lastMeeting:
      null,

    lastMeetingDate:
      null,

    meetings:
      matches.length,
  };

  if (
    matches.length === 0
  ) {
    return facts;
  }

  /* =============================================
     PROCESS H2H MATCHES
  ============================================= */

  const processed =
    matches
      .map(
        (item) => {
          const homeId =
            Number(
              item?.home?.id ??
                item?.homeTeam?.id
            );

          const awayId =
            Number(
              item?.away?.id ??
                item?.awayTeam?.id
            );

          const homeName =
            item?.home?.name ||
            item?.homeTeam?.name ||
            "Home Team";

          const awayName =
            item?.away?.name ||
            item?.awayTeam?.name ||
            "Away Team";

          const homeGoals =
            item?.score?.fulltime
              ?.home ??
            item?.score?.fullTime
              ?.home ??
            item?.score?.home ??
            null;

          const awayGoals =
            item?.score?.fulltime
              ?.away ??
            item?.score?.fullTime
              ?.away ??
            item?.score?.away ??
            null;

          if (
            homeGoals ===
              null ||
            homeGoals ===
              undefined ||
            awayGoals ===
              null ||
            awayGoals ===
              undefined
          ) {
            return null;
          }

          return {
            id:
              item?.id ??
              item?.fixture?.id ??
              null,

            date:
              item?.date ||
              item?.fixture?.date ||
              item?.utcDate ||
              null,

            homeId,

            awayId,

            homeName,

            awayName,

            homeGoals:
              Number(
                homeGoals
              ),

            awayGoals:
              Number(
                awayGoals
              ),
          };
        }
      )
      .filter(Boolean);

  if (
    processed.length === 0
  ) {
    return facts;
  }

  /* =============================================
     TOTAL GOALS
  ============================================= */

  let totalGoals = 0;

  for (
    const game of processed
  ) {
    totalGoals +=
      game.homeGoals +
      game.awayGoals;
  }

  facts.totalGoals =
    totalGoals;

  facts.averageGoals =
    Number(
      (
        totalGoals /
        processed.length
      ).toFixed(2)
    );

  /* =============================================
     CLEAN SHEETS

     "home" and "away" are from the CURRENT
     match's team perspective.
  ============================================= */

  let currentHomeCleanSheets =
    0;

  let currentAwayCleanSheets =
    0;

  /* =============================================
     BIGGEST WIN
  ============================================= */

  let biggestMargin =
    0;

  let biggestWin =
    null;

  for (
    const game of processed
  ) {
    /* ===========================================
       CURRENT HOME TEAM VIEW
    =========================================== */

    const currentHomeIsHome =
      game.homeId ===
      Number(
        currentHomeId
      );

    const currentHomeGoals =
      currentHomeIsHome
        ? game.homeGoals
        : game.awayGoals;

    const currentAwayGoals =
      currentHomeIsHome
        ? game.awayGoals
        : game.homeGoals;

    /* ===========================================
       CLEAN SHEETS
    =========================================== */

    if (
      currentHomeGoals ===
      0
    ) {
      currentAwayCleanSheets++;
    }

    if (
      currentAwayGoals ===
      0
    ) {
      currentHomeCleanSheets++;
    }

    /* ===========================================
       BIGGEST WIN
    =========================================== */

    const margin =
      Math.abs(
        game.homeGoals -
          game.awayGoals
      );

    if (
      margin >
        biggestMargin &&
      margin > 0
    ) {
      biggestMargin =
        margin;

      const winnerIsHome =
        game.homeGoals >
        game.awayGoals;

      biggestWin = {
        winner:
          winnerIsHome
            ? game.homeName
            : game.awayName,

        loser:
          winnerIsHome
            ? game.awayName
            : game.homeName,

        score:
          `${game.homeGoals}-${game.awayGoals}`,

        margin,

        date:
          formatMatchDate(
            game.date
          ),
      };
    }
  }

  facts.cleanSheets.home =
    currentHomeCleanSheets;

  facts.cleanSheets.away =
    currentAwayCleanSheets;

  facts.biggestWinMargin =
    biggestMargin;

  facts.biggestWin =
    biggestWin;

  /* =============================================
     HIGHEST SCORING TEAM

     This means the team with the highest number
     of goals in a single H2H meeting.
  ============================================= */

  let highestGoalCount =
    0;

  let highestScoringTeam =
    null;

  for (
    const game of processed
  ) {
    if (
      game.homeGoals >
      highestGoalCount
    ) {
      highestGoalCount =
        game.homeGoals;

      highestScoringTeam = {
        name:
          game.homeName,

        goals:
          game.homeGoals,
      };
    }

    if (
      game.awayGoals >
      highestGoalCount
    ) {
      highestGoalCount =
        game.awayGoals;

      highestScoringTeam = {
        name:
          game.awayName,

        goals:
          game.awayGoals,
      };
    }
  }

  facts.highestScoringGoals =
    highestGoalCount;

  facts.highestScoringTeam =
    highestScoringTeam;

  /* =============================================
     LAST MEETING

     H2H service already sorts newest first.
  ============================================= */

  const last =
    [...processed].sort(
      (a, b) =>
        new Date(
          b.date || 0
        ).getTime() -
        new Date(
          a.date || 0
        ).getTime()
    )[0];

  if (last) {
    facts.lastMeeting =
      `${last.homeName} ${last.homeGoals}-${last.awayGoals} ${last.awayName}`;

    facts.lastMeetingDate =
      formatMatchDate(
        last.date
      );
  }

  return facts;
}


/* =====================================================
GET MATCH FACTS

GET:

/api/match/:id/facts
===================================================== */

exports.getFacts =
  async (req, res) => {
    const fixtureId =
      req.params.id;

    try {
      /* =============================================
         VALIDATE
      ============================================= */

      if (!fixtureId) {
        return res.status(400).json({
          success: false,

          fixtureId: null,

          facts: null,

          message:
            "Match ID is required",
        });
      }

      console.log(
        `📚 Loading match facts | Match: ${fixtureId}`
      );

      /* =============================================
         LOAD CURRENT MATCH
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

          facts: null,

          message:
            "Match not found",
        });
      }

      /* =============================================
         CURRENT TEAMS
      ============================================= */

      const homeId =
        match.homeTeam?.id ??
        null;

      const awayId =
        match.awayTeam?.id ??
        null;

      const homeName =
        match.homeTeam?.name ||
        match.homeTeam?.shortName ||
        "Home Team";

      const awayName =
        match.awayTeam?.name ||
        match.awayTeam?.shortName ||
        "Away Team";

      /* =============================================
         LOAD H2H

         We reuse the migrated H2H service.

         It searches historical Premier League
         competition matches and is cached.
      ============================================= */

      let h2hMatches = [];

      try {
        const h2h =
          await getHeadToHead(
            homeId,
            awayId,
            {
              limit: 20,
            }
          );

        h2hMatches =
          Array.isArray(
            h2h?.matches
          )
            ? h2h.matches
            : [];
      } catch (error) {
        console.warn(
          "⚠️ Unable to load H2H for facts:",
          error.message
        );
      }

      /* =============================================
         BUILD FACTS
      ============================================= */

      const facts =
        buildFacts(
          match,
          h2hMatches,
          homeId,
          awayId
        );

      /* =============================================
         ADD CURRENT MATCH CONTEXT
      ============================================= */

      facts.homeTeam = {
        id:
          homeId,

        name:
          homeName,

        logo:
          match.homeTeam?.crest ||
          null,
      };

      facts.awayTeam = {
        id:
          awayId,

        name:
          awayName,

        logo:
          match.awayTeam?.crest ||
          null,
      };

      /* =============================================
         RESPONSE
      ============================================= */

      console.log(
        `✅ Match facts loaded | H2H meetings: ${h2hMatches.length}`
      );

      return res.json({
        success: true,

        fixtureId:
          Number(fixtureId) ||
          fixtureId,

        count:
          h2hMatches.length,

        facts,

        source:
          "football-data.org",

        message:
          h2hMatches.length > 0
            ? "Match facts loaded"
            : "No historical facts available",
      });
    } catch (error) {
      console.error(
        "❌ FactsController:",
        error.response?.data ||
          error.message
      );

      return res.status(500).json({
        success: false,

        fixtureId,

        count: 0,

        facts: null,

        source:
          "football-data.org",

        message:
          "Unable to load match facts",

        error:
          error.response?.data ||
          error.message,
      });
    }
  };