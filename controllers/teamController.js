// controllers/teamController.js

const {
  footballDataGet,
} = require("../services/footballDataApi");

/* =====================================================
CONFIGURATION
===================================================== */

const DEFAULT_SEASON = new Date().getMonth() >= 6
  ? new Date().getFullYear()
  : new Date().getFullYear() - 1;

const LEAGUES = {
  epl: {
    code: "PL",
    id: 2021,
    name: "Premier League",
    country: "England",
  },
};

/* =====================================================
SEASON RESOLVER

football-data.org:

2024 = 2024/25
2025 = 2025/26
2026 = 2026/27
===================================================== */

function resolveSeason(value) {
  const season = parseInt(value, 10);

  if (
    !Number.isNaN(season) &&
    season >= 2000 &&
    season <= 2100
  ) {
    return season;
  }

  return DEFAULT_SEASON;
}

/* =====================================================
SAFE NUMBER
===================================================== */

function num(value) {
  const n = Number(value);

  return Number.isFinite(n)
    ? n
    : 0;
}

/* =====================================================
SEASON DATE RANGE
===================================================== */

function getSeasonDates(season) {
  return {
    dateFrom:
      `${season}-07-01`,

    dateTo:
      `${season + 1}-06-30`,
  };
}

/* =====================================================
GET TEAM DATA

football-data.org:

/teams/:id
===================================================== */

async function loadTeam(teamId) {
  console.log(
    `🌍 Football-data.org team profile: /teams/${teamId}`
  );

  return await footballDataGet(
    `/teams/${teamId}`
  );
}

/* =====================================================
GET TEAM MATCHES

football-data.org:

/teams/:id/matches
===================================================== */

async function loadTeamMatches(
  teamId,
  season,
  options = {}
) {
  const dates =
    getSeasonDates(season);

  const params = {
    dateFrom:
      dates.dateFrom,

    dateTo:
      dates.dateTo,

    limit:
      options.limit || 100,
  };

  if (options.status) {
    params.status =
      options.status;
  }

  console.log(
    `🌍 Football-data.org team matches: /teams/${teamId}/matches`
  );

  console.log(
    "Football-data.org team match params:",
    params
  );

  return await footballDataGet(
    `/teams/${teamId}/matches`,
    params
  );
}

/* =====================================================
NORMALIZE TEAM

Produces the structure expected by the current
Apex Sports Team components.
===================================================== */

function normalizeTeam(
  team,
  season,
  players = [],
  fixtures = []
) {
  if (!team) {
    return null;
  }

  const coach =
    team.coach || null;

  const venue =
    team.venue || null;

  const area =
    team.area || {};

  const competitions =
    Array.isArray(
      team.runningCompetitions
    )
      ? team.runningCompetitions
      : [];

  return {
    id:
      team.id ?? null,

    name:
      team.name ||
      "Unknown Team",

    shortName:
      team.shortName ||
      team.name ||
      "",

    tla:
      team.tla ||
      "",

    crest:
      team.crest ||
      null,

    logo:
      team.crest ||
      null,

    founded:
      team.founded ||
      null,

    address:
      team.address ||
      null,

    website:
      team.website ||
      null,

    clubColors:
      team.clubColors ||
      null,

    country:
      area.name ||
      "England",

    area: {
      id:
        area.id ??
        null,

      name:
        area.name ||
        null,

      code:
        area.code ||
        null,

      flag:
        area.flag ||
        null,
    },

    venue: {
      name:
        venue?.name ||
        null,

      address:
        venue?.address ||
        null,

      city:
        venue?.city ||
        null,
    },

    coach: coach
      ? {
          id:
            coach.id ??
            null,

          firstName:
            coach.firstName ||
            null,

          lastName:
            coach.lastName ||
            null,

          name:
            [
              coach.firstName,
              coach.lastName,
            ]
              .filter(Boolean)
              .join(" ") ||
            coach.name ||
            null,

          dateOfBirth:
            coach.dateOfBirth ||
            null,

          nationality:
            coach.nationality ||
            null,
        }
      : null,

    players,

    squad:
      players,

    fixtures,

    competitions,

    season,
  };
}

/* =====================================================
NORMALIZE PLAYERS

football-data.org team resource provides squad data.
===================================================== */

function normalizePlayers(
  squad,
  team
) {
  if (
    !Array.isArray(squad)
  ) {
    return [];
  }

  return squad.map(
    (player) => ({
      player: {
        id:
          player?.id ??
          null,

        name:
          player?.name ||
          "Unknown Player",

        firstName:
          player?.firstName ||
          null,

        lastName:
          player?.lastName ||
          null,

        dateOfBirth:
          player?.dateOfBirth ||
          null,

        nationality:
          player?.nationality ||
          null,

        position:
          player?.position ||
          null,

        shirtNumber:
          player?.shirtNumber ??
          null,
      },

      team: {
        id:
          team?.id ??
          null,

        name:
          team?.name ||
          "Unknown Team",

        logo:
          team?.crest ||
          null,
      },

      statistics: [],
    })
  );
}

/* =====================================================
NORMALIZE FIXTURE

Convert football-data.org match format into a structure
that existing Apex Sports components can understand.
===================================================== */

function normalizeFixture(
  match
) {
  if (!match) {
    return null;
  }

  const fullTime =
    match.score?.fullTime ||
    {};

  return {
    id:
      match.id ??
      null,

    utcDate:
      match.utcDate ||
      null,

    status:
      match.status ||
      null,

    stage:
      match.stage ||
      null,

    group:
      match.group ||
      null,

    homeTeam: {
      id:
        match.homeTeam?.id ??
        null,

      name:
        match.homeTeam?.name ||
        "Home Team",

      shortName:
        match.homeTeam?.shortName ||
        null,

      tla:
        match.homeTeam?.tla ||
        null,

      crest:
        match.homeTeam?.crest ||
        null,

      logo:
        match.homeTeam?.crest ||
        null,
    },

    awayTeam: {
      id:
        match.awayTeam?.id ??
        null,

      name:
        match.awayTeam?.name ||
        "Away Team",

      shortName:
        match.awayTeam?.shortName ||
        null,

      tla:
        match.awayTeam?.tla ||
        null,

      crest:
        match.awayTeam?.crest ||
        null,

      logo:
        match.awayTeam?.crest ||
        null,
    },

    competition: {
      id:
        match.competition?.id ??
        null,

      name:
        match.competition?.name ||
        "Premier League",

      code:
        match.competition?.code ||
        "PL",

      emblem:
        match.competition?.emblem ||
        null,
    },

    score: {
      fullTime: {
        home:
          fullTime.home ??
          null,

        away:
          fullTime.away ??
          null,
      },

      halfTime: {
        home:
          match.score?.halfTime
            ?.home ??
          null,

        away:
          match.score?.halfTime
            ?.away ??
          null,
      },
    },

    venue: {
      name:
        match.venue?.name ||
        null,

      city:
        match.venue?.city ||
        null,
    },
  };
}

/* =====================================================
GET TEAM
===================================================== */

exports.getTeam =
  async (
    req,
    res
  ) => {
    try {
      const teamId =
        parseInt(
          req.params.id,
          10
        );

      const season =
        resolveSeason(
          req.query.season
        );

      if (
        Number.isNaN(teamId)
      ) {
        return res.status(400).json({
          success: false,
          team: null,
          message:
            "Invalid team identifier",
        });
      }

      console.log(
        "======================================"
      );

      console.log(
        `⚽ Loading team ${teamId} | Season ${season}`
      );

      /* ---------------------------------------------
         TEAM PROFILE
      --------------------------------------------- */

      const teamData =
        await loadTeam(
          teamId
        );

      if (!teamData) {
        return res.status(404).json({
          success: false,
          team: null,
          message:
            "Team not found",
        });
      }

      /* ---------------------------------------------
         SQUAD
      --------------------------------------------- */

      const players =
        normalizePlayers(
          teamData.squad,
          teamData
        );

      /* ---------------------------------------------
         MATCHES
      --------------------------------------------- */

      let matches = [];

      try {
        const response =
          await loadTeamMatches(
            teamId,
            season,
            {
              limit: 100,
            }
          );

        matches =
          Array.isArray(
            response?.matches
          )
            ? response.matches
            : [];
      } catch (error) {
        console.warn(
          "⚠️ Team matches unavailable:",
          error.response?.data ||
            error.message
        );
      }

      const fixtures =
        matches
          .map(
            normalizeFixture
          )
          .filter(Boolean);

      const team =
        normalizeTeam(
          teamData,
          season,
          players,
          fixtures
        );

      console.log(
        `✅ Team loaded: ${team.name}`
      );

      console.log(
        `👥 Squad: ${players.length}`
      );

      console.log(
        `📅 Fixtures: ${fixtures.length}`
      );

      console.log(
        "======================================"
      );

      return res.json({
        success: true,
        season,
        team,
        source:
          "football-data.org",
        message:
          "Team loaded",
      });
    } catch (error) {
      console.error(
        "🔥 TeamController:",
        error.response?.data ||
          error.message
      );

      return res.status(500).json({
        success: false,
        team: null,
        message:
          "Unable to load team",
      });
    }
  };

/* =====================================================
TEAM PLAYERS
===================================================== */

exports.getPlayers =
  async (
    req,
    res
  ) => {
    try {
      const teamId =
        parseInt(
          req.params.id,
          10
        );

      if (
        Number.isNaN(teamId)
      ) {
        return res.status(400).json({
          success: false,
          players: [],
          message:
            "Invalid team identifier",
        });
      }

      const teamData =
        await loadTeam(
          teamId
        );

      if (!teamData) {
        return res.status(404).json({
          success: false,
          players: [],
          message:
            "Team not found",
        });
      }

      const players =
        normalizePlayers(
          teamData.squad,
          teamData
        );

      return res.json({
        success: true,
        count:
          players.length,
        players,
        source:
          "football-data.org",
        message:
          "Team players loaded",
      });
    } catch (error) {
      console.error(
        "🔥 Team Players:",
        error.response?.data ||
          error.message
      );

      return res.status(500).json({
        success: false,
        players: [],
        message:
          "Unable to load team players",
      });
    }
  };

/* =====================================================
TEAM STATISTICS

Calculated from football-data.org matches.
===================================================== */

exports.getStatistics =
  async (
    req,
    res
  ) => {
    try {
      const teamId =
        parseInt(
          req.params.id,
          10
        );

      const season =
        resolveSeason(
          req.query.season
        );

      if (
        Number.isNaN(teamId)
      ) {
        return res.status(400).json({
          success: false,
          statistics: null,
          message:
            "Invalid team identifier",
        });
      }

      const response =
        await loadTeamMatches(
          teamId,
          season,
          {
            limit: 100,
          }
        );

      const matches =
        Array.isArray(
          response?.matches
        )
          ? response.matches
          : [];

      const stats = {
        played: 0,

        wins: 0,

        draws: 0,

        losses: 0,

        goalsFor: 0,

        goalsAgainst: 0,

        cleanSheets: 0,

        failedToScore: 0,

        points: 0,

        form: "",

        biggestWin: null,

        biggestLoss: null,

        goals: {
          for: {
            total: 0,
          },

          against: {
            total: 0,
          },
        },

        cards: {},

        lineups: [],

        home: {
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
        },

        away: {
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
        },

        season,
      };

      const completed =
        matches.filter(
          (match) =>
            match?.status ===
              "FINISHED" ||
            match?.status ===
              "AWARDED"
        );

      const form = [];

      for (
        const match
        of completed
      ) {
        const isHome =
          match.homeTeam?.id ===
          teamId;

        const isAway =
          match.awayTeam?.id ===
          teamId;

        if (
          !isHome &&
          !isAway
        ) {
          continue;
        }

        const homeGoals =
          match.score?.fullTime
            ?.home;

        const awayGoals =
          match.score?.fullTime
            ?.away;

        if (
          homeGoals === null ||
          homeGoals === undefined ||
          awayGoals === null ||
          awayGoals === undefined
        ) {
          continue;
        }

        stats.played++;

        const scored =
          isHome
            ? num(homeGoals)
            : num(awayGoals);

        const conceded =
          isHome
            ? num(awayGoals)
            : num(homeGoals);

        stats.goalsFor +=
          scored;

        stats.goalsAgainst +=
          conceded;

        if (
          conceded === 0
        ) {
          stats.cleanSheets++;
        }

        if (
          scored === 0
        ) {
          stats.failedToScore++;
        }

        const goalDifference =
          scored -
          conceded;

        if (
          isHome
        ) {
          stats.home.played++;
        } else {
          stats.away.played++;
        }

        if (
          goalDifference > 0
        ) {
          stats.wins++;

          stats.points += 3;

          form.push("W");

          if (
            isHome
          ) {
            stats.home.wins++;
          } else {
            stats.away.wins++;
          }
        } else if (
          goalDifference === 0
        ) {
          stats.draws++;

          stats.points += 1;

          form.push("D");

          if (
            isHome
          ) {
            stats.home.draws++;
          } else {
            stats.away.draws++;
          }
        } else {
          stats.losses++;

          form.push("L");

          if (
            isHome
          ) {
            stats.home.losses++;
          } else {
            stats.away.losses++;
          }
        }

        if (
          !stats.biggestWin ||
          goalDifference >
            stats.biggestWin
              .difference
        ) {
          if (
            goalDifference > 0
          ) {
            stats.biggestWin = {
              difference:
                goalDifference,

              score:
                `${isHome ? homeGoals : awayGoals}-${isHome ? awayGoals : homeGoals}`,
            };
          }
        }

        if (
          !stats.biggestLoss ||
          Math.abs(
            goalDifference
          ) >
            stats.biggestLoss
              .difference
        ) {
          if (
            goalDifference < 0
          ) {
            stats.biggestLoss = {
              difference:
                Math.abs(
                  goalDifference
                ),

              score:
                `${isHome ? homeGoals : awayGoals}-${isHome ? awayGoals : homeGoals}`,
            };
          }
        }
      }

      stats.form =
        form
          .slice(-5)
          .join("");

      stats.goals.for.total =
        stats.goalsFor;

      stats.goals.against.total =
        stats.goalsAgainst;

      return res.json({
        success: true,
        season,
        statistics: stats,
        source:
          "football-data.org",
        message:
          "Team statistics loaded",
      });
    } catch (error) {
      console.error(
        "🔥 Team Statistics:",
        error.response?.data ||
          error.message
      );

      return res.status(500).json({
        success: false,
        statistics: null,
        message:
          "Unable to load team statistics",
      });
    }
  };

/* =====================================================
TEAM FIXTURES

Upcoming matches.
===================================================== */

exports.getFixtures =
  async (
    req,
    res
  ) => {
    try {
      const teamId =
        parseInt(
          req.params.id,
          10
        );

      const season =
        resolveSeason(
          req.query.season
        );

      if (
        Number.isNaN(teamId)
      ) {
        return res.status(400).json({
          success: false,
          fixtures: [],
          message:
            "Invalid team identifier",
        });
      }

      const response =
        await loadTeamMatches(
          teamId,
          season,
          {
            status:
              "SCHEDULED",
            limit: 20,
          }
        );

      const fixtures =
        Array.isArray(
          response?.matches
        )
          ? response.matches
              .map(
                normalizeFixture
              )
              .filter(Boolean)
          : [];

      return res.json({
        success: true,
        season,
        count:
          fixtures.length,
        fixtures,
        source:
          "football-data.org",
        message:
          "Team fixtures loaded",
      });
    } catch (error) {
      console.error(
        "🔥 Team Fixtures:",
        error.response?.data ||
          error.message
      );

      return res.status(500).json({
        success: false,
        fixtures: [],
        message:
          "Unable to load team fixtures",
      });
    }
  };

/* =====================================================
TEAM HISTORY

Recent completed matches.
===================================================== */

exports.getHistory =
  async (
    req,
    res
  ) => {
    try {
      const teamId =
        parseInt(
          req.params.id,
          10
        );

      const season =
        resolveSeason(
          req.query.season
        );

      if (
        Number.isNaN(teamId)
      ) {
        return res.status(400).json({
          success: false,
          history: [],
          message:
            "Invalid team identifier",
        });
      }

      const response =
        await loadTeamMatches(
          teamId,
          season,
          {
            status:
              "FINISHED",
            limit: 20,
          }
        );

      const history =
        Array.isArray(
          response?.matches
        )
          ? response.matches
              .map(
                normalizeFixture
              )
              .filter(Boolean)
              .sort(
                (a, b) =>
                  new Date(
                    b.utcDate
                  ) -
                  new Date(
                    a.utcDate
                  )
              )
          : [];

      return res.json({
        success: true,
        season,
        count:
          history.length,
        history,
        source:
          "football-data.org",
        message:
          "Team history loaded",
      });
    } catch (error) {
      console.error(
        "🔥 Team History:",
        error.response?.data ||
          error.message
      );

      return res.status(500).json({
        success: false,
        history: [],
        message:
          "Unable to load team history",
      });
    }
  };

/* =====================================================
TEAM COACH

Comes from the team resource.
===================================================== */

exports.getCoach =
  async (
    req,
    res
  ) => {
    try {
      const teamId =
        parseInt(
          req.params.id,
          10
        );

      if (
        Number.isNaN(teamId)
      ) {
        return res.status(400).json({
          success: false,
          coach: null,
          message:
            "Invalid team identifier",
        });
      }

      const team =
        await loadTeam(
          teamId
        );

      const coach =
        team?.coach || null;

      return res.json({
        success: true,
        coach,
        source:
          "football-data.org",
        message:
          coach
            ? "Team coach loaded"
            : "Coach information unavailable",
      });
    } catch (error) {
      console.error(
        "🔥 Team Coach:",
        error.response?.data ||
          error.message
      );

      return res.status(500).json({
        success: false,
        coach: null,
        message:
          "Unable to load team coach",
      });
    }
  };

/* =====================================================
TEAM TRANSFERS

football-data.org does not provide the equivalent
API-Football transfer endpoint.
===================================================== */

exports.getTransfers =
  async (
    req,
    res
  ) => {
    return res.json({
      success: true,
      count: 0,
      transfers: [],
      available: false,
      source:
        "football-data.org",
      message:
        "Team transfers are not available from football-data.org",
    });
  };

/* =====================================================
TEAM INJURIES

football-data.org does not provide the equivalent
API-Football injuries endpoint.
===================================================== */

exports.getInjuries =
  async (
    req,
    res
  ) => {
    return res.json({
      success: true,
      count: 0,
      injuries: [],
      available: false,
      source:
        "football-data.org",
      message:
        "Team injury data is not available from football-data.org",
    });
  };

/* =====================================================
TEAM TROPHIES

football-data.org does not provide the equivalent
API-Football trophies endpoint.
===================================================== */

exports.getTrophies =
  async (
    req,
    res
  ) => {
    return res.json({
      success: true,
      count: 0,
      trophies: [],
      available: false,
      source:
        "football-data.org",
      message:
        "Team trophy data is not available from football-data.org",
    });
  };