// controllers/leagueController.js

const {
  footballDataGet,
  getFinishedMatches,
  getCompetition,
  getCompetitionTeams,
  getPremierLeagueMatches,
} = require("../services/footballDataApi");

const {
  getLeagueId,
} = require("../utils/leagueMap");


/* =========================================================
HELPERS
========================================================= */

function resolveFootballDataSeason(requestedSeason) {
  const season = parseInt(requestedSeason, 10);

  if (Number.isNaN(season)) {
    return new Date().getMonth() >= 6
      ? new Date().getFullYear()
      : new Date().getFullYear() - 1;
  }

  return season;
}


/* =========================================================
SUPPORTED LEAGUE CHECK
========================================================= */

function isPremierLeague(value) {
  const slug = String(value || "").toLowerCase();

  return (
    slug === "epl" ||
    slug === "premier-league" ||
    slug === "39"
  );
}


/* =========================================================
GET PREMIER LEAGUE ID
========================================================= */

function getPremierLeagueId() {
  return 39;
}


/* =========================================================
FORMAT FOOTBALL-DATA TEAM

Creates a stable structure for the existing frontend.
========================================================= */

function formatTeam(team) {
  if (!team) {
    return null;
  }

  return {
    team: {
      id: team.id ?? null,

      name:
        team.name ||
        team.shortName ||
        "Unknown Team",

      code: team.tla || null,

      country:
        team.area?.name ||
        "England",

      founded: team.founded ?? null,

      national: team.national ?? false,

      logo: team.crest || null,

      venue: team.venue || null,

      address: team.address || null,

      website: team.website || null,

      colors: team.clubColors || null,
    },

    venue: {
      name: team.venue || null,

      address: team.address || null,

      city: team.area?.name || null,

      capacity: null,

      image: null,
    },

    coach: null,

    players:
      Array.isArray(team.squad)
        ? team.squad
        : [],
  };
}


/* =========================================================
FORMAT FOOTBALL-DATA MATCH

Normalizes football-data.org matches into the common
Apex Sports fixture structure.
========================================================= */

function formatFootballDataMatch(match) {
  if (!match) {
    return null;
  }

  const homeScore =
    match.score?.fullTime?.home;

  const awayScore =
    match.score?.fullTime?.away;

  const status =
    match.status || null;

  return {
    fixture: {
      id: match.id ?? null,

      date: match.utcDate || null,

      timestamp:
        match.utcDate
          ? Math.floor(
              new Date(match.utcDate).getTime() / 1000
            )
          : null,

      status: {
        short: status,

        long: status,

        elapsed: null,
      },

      venue: {
        name: null,

        city: null,
      },

      referee: null,
    },

    league: {
      id:
        match.competition?.id ??
        2021,

      name:
        match.competition?.name ||
        "Premier League",

      country:
        match.area?.name ||
        "England",

      logo:
        match.competition?.emblem ||
        "https://crests.football-data.org/PL.png",

      code:
        match.competition?.code ||
        "PL",

      season:
        match.season?.startDate
          ? parseInt(
              match.season.startDate.slice(0, 4),
              10
            )
          : null,
    },

    teams: {
      home: {
        id:
          match.homeTeam?.id ??
          null,

        name:
          match.homeTeam?.name ||
          match.homeTeam?.shortName ||
          "Home Team",

        logo:
          match.homeTeam?.crest ||
          null,

        winner:
          typeof homeScore === "number" &&
          typeof awayScore === "number"
            ? homeScore > awayScore
            : null,
      },

      away: {
        id:
          match.awayTeam?.id ??
          null,

        name:
          match.awayTeam?.name ||
          match.awayTeam?.shortName ||
          "Away Team",

        logo:
          match.awayTeam?.crest ||
          null,

        winner:
          typeof homeScore === "number" &&
          typeof awayScore === "number"
            ? awayScore > homeScore
            : null,
      },
    },

    goals: {
      home: homeScore ?? null,

      away: awayScore ?? null,
    },

    score: match.score || {},

    raw: match,
  };
}


/* =========================================================
FORMAT STANDINGS
========================================================= */

function formatStandings(data) {
  const tables =
    Array.isArray(data?.standings)
      ? data.standings
      : [];

  const totalTable =
    tables.find(
      (table) =>
        table?.type === "TOTAL"
    ) ||
    tables[0];

  const table =
    Array.isArray(totalTable?.table)
      ? totalTable.table
      : [];

  return table.map((team) => ({
    rank: team.position,

    id:
      team.team?.id ??
      null,

    name:
      team.team?.name ||
      team.team?.shortName ||
      "Unknown Team",

    shortName:
      team.team?.shortName ||
      null,

    tla:
      team.team?.tla ||
      null,

    crest:
      team.team?.crest ||
      null,

    played:
      team.playedGames ??
      0,

    win:
      team.won ??
      0,

    draw:
      team.draw ??
      0,

    lose:
      team.lost ??
      0,

    goalsFor:
      team.goalsFor ??
      0,

    goalsAgainst:
      team.goalsAgainst ??
      0,

    goalDifference:
      team.goalDifference ??
      0,

    points:
      team.points ??
      0,
  }));
}


/* =========================================================
FORMAT SCORERS

football-data.org scorer data contains:

- goals
- assists
- appearances
- player information
- team information

This formatter creates the structure expected by Apex Sports.
========================================================= */

function formatScorers(data) {
  if (
    !Array.isArray(data?.scorers)
  ) {
    return [];
  }

  return data.scorers.map((scorer) => {
    const player =
      scorer.player ||
      {};

    const team =
      scorer.team ||
      {};

    return {
      player: {
        id:
          player.id ??
          null,

        name:
          player.name ||
          "Unknown Player",

        firstName:
          player.firstName ||
          null,

        lastName:
          player.lastName ||
          null,

        dateOfBirth:
          player.dateOfBirth ||
          null,

        nationality:
          player.nationality ||
          null,

        position:
          player.position ||
          null,

        photo:
          null,
      },

      statistics: [
        {
          team: {
            id:
              team.id ??
              null,

            name:
              team.name ||
              team.shortName ||
              "Unknown Team",

            logo:
              team.crest ||
              null,
          },

          games: {
            appearances:
              scorer.playedMatches ??
              0,

            appearences:
              scorer.playedMatches ??
              0,
          },

          goals: {
            total:
              scorer.goals ??
              0,

            assists:
              scorer.assists ??
              0,
          },
        },
      ],
    };
  });
}


/* =========================================================
GET LEAGUE OVERVIEW

/api/league/epl

FULLY MIGRATED TO FOOTBALL-DATA.ORG
========================================================= */

exports.getLeague =
  async (req, res) => {
    try {
      if (
        !isPremierLeague(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,

          season: null,

          league: null,

          message:
            "League currently supported for Premier League only",
        });
      }

      const season =
        resolveFootballDataSeason(
          req.query.season
        );

      const competition = "PL";

      console.log(
        `🏆 Loading Premier League overview | Season ${season}`
      );

      const [
        competitionData,
        teamsData,
        fixturesData,
        standingsData,
        scorersData,
      ] =
        await Promise.all([
          getCompetition(
            competition
          ),

          getCompetitionTeams(
            competition
          ),

          getPremierLeagueMatches({
            season,
          }),

          footballDataGet(
            "/competitions/PL/standings",
            {
              season,
            }
          ),

          footballDataGet(
            "/competitions/PL/scorers",
            {
              season,
            }
          ),
        ]);

      if (!competitionData) {
        return res.status(404).json({
          success: false,

          season,

          league: null,

          message:
            "Premier League not found",
        });
      }

      /* =============================================
         TEAMS
      ============================================= */

      const teams =
        Array.isArray(
          teamsData
        )
          ? teamsData
              .map(formatTeam)
              .filter(Boolean)
          : [];


      /* =============================================
         FIXTURES
      ============================================= */

      const rawMatches =
        Array.isArray(
          fixturesData?.matches
        )
          ? fixturesData.matches
          : [];

      const fixtures =
        rawMatches
          .map(
            formatFootballDataMatch
          )
          .filter(Boolean);


      /* =============================================
         STANDINGS
      ============================================= */

      const standings =
        formatStandings(
          standingsData
        );


      /* =============================================
         TOP SCORERS
      ============================================= */

      const scorers =
        formatScorers(
          scorersData
        );


      /* =============================================
         TOP ASSISTS

         Same football-data.org scorer dataset,
         sorted separately by assists.
      ============================================= */

      const assists =
        [...scorers].sort(
          (a, b) => {
            const assistsA =
              a
                ?.statistics?.[0]
                ?.goals?.assists ||
              0;

            const assistsB =
              b
                ?.statistics?.[0]
                ?.goals?.assists ||
              0;

            return (
              assistsB -
              assistsA
            );
          }
        );


      /* =============================================
         LEAGUE OBJECT
      ============================================= */

      const league = {
        id:
          competitionData.id ??
          getPremierLeagueId(),

        name:
          competitionData.name ||
          "Premier League",

        code:
          competitionData.code ||
          "PL",

        country:
          competitionData.area?.name ||
          "England",

        logo:
          competitionData.emblem ||
          "https://crests.football-data.org/PL.png",

        season,

        currentSeason:
          competitionData.currentSeason ||
          null,

        startDate:
          competitionData.currentSeason
            ?.startDate ||
          null,

        endDate:
          competitionData.currentSeason
            ?.endDate ||
          null,

        standings,

        scorers,

        assists,

        fixtures,

        teams,

        raw:
          competitionData,
      };


      console.log(
        "======================================"
      );

      console.log(
        "📊 Premier League Overview Loaded"
      );

      console.log(
        "Source     : football-data.org"
      );

      console.log(
        "Season     :",
        season
      );

      console.log(
        "Teams      :",
        teams.length
      );

      console.log(
        "Fixtures   :",
        fixtures.length
      );

      console.log(
        "Standings  :",
        standings.length
      );

      console.log(
        "Scorers    :",
        scorers.length
      );

      console.log(
        "Assists    :",
        assists.length
      );

      console.log(
        "======================================"
      );


      return res.json({
        success: true,

        season,

        league,

        source:
          "football-data.org",

        message:
          "Premier League overview loaded",
      });
    } catch (error) {
      console.error(
        "❌ getLeague football-data.org:",
        error.response?.data ||
          error.message
      );

      const status =
        error.response?.status >= 400 &&
        error.response?.status < 600
          ? error.response.status
          : 500;

      return res.status(
        status
      ).json({
        success: false,

        season: null,

        league: null,

        source:
          "football-data.org",

        message:
          "Unable to load Premier League overview",

        error:
          error.response?.data ||
          error.message,
      });
    }
  };


/* =========================================================
GET FIXTURES

/api/league/epl/fixtures

FULLY MIGRATED TO FOOTBALL-DATA.ORG
========================================================= */

exports.getFixtures =
  async (req, res) => {
    try {
      const leagueId =
        String(
          req.params.id ||
            ""
        ).toLowerCase();

      if (
        leagueId !== "epl" &&
        leagueId !== "premier-league"
      ) {
        return res.status(400).json({
          success: false,

          fixtures: [],

          message:
            "Fixtures currently supported for Premier League only",
        });
      }

      const page =
        parseInt(
          req.query.page,
          10
        ) || 1;

      const limit =
        parseInt(
          req.query.limit,
          10
        ) || 10;

      const season =
        resolveFootballDataSeason(
          req.query.season
        );

      console.log(
        `📅 Loading Premier League fixtures | Season ${season}`
      );

      const data =
        await getPremierLeagueMatches({
          season,
        });

      let matches =
        Array.isArray(
          data?.matches
        )
          ? data.matches
          : [];

      matches =
        matches
          .map(
            formatFootballDataMatch
          )
          .filter(Boolean);

      const start =
        (page - 1) *
        limit;

      const end =
        start + limit;

      const paginatedFixtures =
        matches.slice(
          start,
          end
        );

      console.log(
        `✅ Fixtures loaded | Season ${season} | Total ${matches.length} | Page ${page}`
      );

      return res.json({
        success: true,

        season,

        page,

        limit,

        total:
          matches.length,

        count:
          paginatedFixtures.length,

        fixtures:
          paginatedFixtures,

        source:
          "football-data.org",
      });
    } catch (error) {
      console.error(
        "❌ getFixtures football-data.org:",
        error.response?.data ||
          error.message
      );

      return res.status(500).json({
        success: false,

        fixtures: [],

        message:
          "Unable to load Premier League fixtures",

        error:
          error.response?.data ||
          error.message,
      });
    }
  };


/* =========================================================
GET RESULTS

/api/league/epl/results

FULLY MIGRATED TO FOOTBALL-DATA.ORG
========================================================= */

exports.getResults =
  async (req, res) => {
    try {
      if (
        !isPremierLeague(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,

          season: null,

          page: 1,

          limit: 10,

          total: 0,

          count: 0,

          results: [],

          message:
            "Results currently supported for Premier League only",
        });
      }

      const page =
        parseInt(
          req.query.page,
          10
        ) || 1;

      const limit =
        parseInt(
          req.query.limit,
          10
        ) || 10;

      const season =
        resolveFootballDataSeason(
          req.query.season
        );

      console.log(
        `📊 Loading Premier League results | Season ${season}`
      );

      let matches =
        await getFinishedMatches({
          season,
        });

      if (
        !Array.isArray(
          matches
        )
      ) {
        matches = [];
      }

      matches =
        matches.filter(
          (match) =>
            match?.status ===
            "FINISHED"
        );

      const seasonStart =
        new Date(
          `${season}-07-01T00:00:00Z`
        );

      const seasonEnd =
        new Date(
          `${season + 1}-06-30T23:59:59Z`
        );

      matches =
        matches.filter(
          (match) => {
            if (
              !match?.utcDate
            ) {
              return false;
            }

            const date =
              new Date(
                match.utcDate
              );

            return (
              date >= seasonStart &&
              date <= seasonEnd
            );
          }
        );

      matches =
        [...matches].sort(
          (a, b) =>
            new Date(
              b.utcDate
            ) -
            new Date(
              a.utcDate
            )
        );

      const start =
        (page - 1) *
        limit;

      const end =
        start + limit;

      const results =
        matches.slice(
          start,
          end
        );

      return res.json({
        success: true,

        season,

        page,

        limit,

        total:
          matches.length,

        count:
          results.length,

        results,

        source:
          "football-data.org",
      });
    } catch (error) {
      console.error(
        "❌ getResults football-data.org:",
        error.response?.data ||
          error.message
      );

      return res.status(500).json({
        success: false,

        season: null,

        page: 1,

        limit: 10,

        total: 0,

        count: 0,

        results: [],

        message:
          "Unable to load Premier League results",

        error:
          error.response?.data ||
          error.message,
      });
    }
  };


/* =========================================================
GET STANDINGS

/api/league/epl/standings

FULLY MIGRATED TO FOOTBALL-DATA.ORG
========================================================= */

exports.getStandings =
  async (req, res) => {
    try {
      if (
        !isPremierLeague(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,

          season: null,

          count: 0,

          standings: [],

          message:
            "Standings currently supported for Premier League only",
        });
      }

      const season =
        resolveFootballDataSeason(
          req.query.season
        );

      console.log(
        `📊 Loading Premier League standings | Season ${season}`
      );

      const data =
        await footballDataGet(
          "/competitions/PL/standings",
          {
            season,
          }
        );

      const standings =
        formatStandings(
          data
        );

      if (
        standings.length === 0
      ) {
        return res.json({
          success: false,

          season,

          count: 0,

          standings: [],

          message:
            "No standings available",

          source:
            "football-data.org",
        });
      }

      return res.json({
        success: true,

        season,

        league: {
          id:
            getPremierLeagueId(),

          code:
            "PL",

          name:
            "Premier League",
        },

        count:
          standings.length,

        standings,

        source:
          "football-data.org",

        message:
          "Standings loaded",
      });
    } catch (error) {
      console.error(
        "❌ getStandings football-data.org:",
        error.response?.data ||
          error.message
      );

      return res.status(500).json({
        success: false,

        season: null,

        count: 0,

        standings: [],

        message:
          "Unable to load Premier League standings",

        error:
          error.response?.data ||
          error.message,
      });
    }
  };


/* =========================================================
GET TOP SCORERS

/api/league/epl/topscorers

FULLY MIGRATED TO FOOTBALL-DATA.ORG
========================================================= */

exports.getTopScorers =
  async (req, res) => {
    try {
      if (
        !isPremierLeague(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,

          season: null,

          page: 1,

          limit: 20,

          total: 0,

          count: 0,

          players: [],

          message:
            "Top scorers currently supported for Premier League only",
        });
      }

      const page =
        parseInt(
          req.query.page,
          10
        ) || 1;

      const limit =
        parseInt(
          req.query.limit,
          10
        ) || 20;

      const season =
        resolveFootballDataSeason(
          req.query.season
        );

      console.log(
        `🎯 Loading Premier League top scorers | Season ${season}`
      );

      const data =
        await footballDataGet(
          "/competitions/PL/scorers",
          {
            season,
          }
        );

      const players =
        formatScorers(
          data
        );

      players.sort(
        (a, b) => {
          const goalsA =
            a
              ?.statistics?.[0]
              ?.goals?.total ||
            0;

          const goalsB =
            b
              ?.statistics?.[0]
              ?.goals?.total ||
            0;

          return (
            goalsB -
            goalsA
          );
        }
      );

      const total =
        players.length;

      const start =
        (page - 1) *
        limit;

      const end =
        start + limit;

      const paginatedPlayers =
        players.slice(
          start,
          end
        );

      return res.json({
        success: true,

        season,

        page,

        limit,

        total,

        count:
          paginatedPlayers.length,

        players:
          paginatedPlayers,

        source:
          "football-data.org",

        message:
          "Top scorers loaded",
      });
    } catch (error) {
      console.error(
        "❌ getTopScorers football-data.org:",
        error.response?.data ||
          error.message
      );

      return res.status(500).json({
        success: false,

        season: null,

        page: 1,

        limit: 20,

        total: 0,

        count: 0,

        players: [],

        message:
          "Unable to load Premier League top scorers",

        error:
          error.response?.data ||
          error.message,
      });
    }
  };


/* =========================================================
GET TOP ASSISTS

/api/league/epl/topassists

FULLY MIGRATED TO FOOTBALL-DATA.ORG

IMPORTANT:

football-data.org does not have a separate
/topassists endpoint.

The assists are included in:

/competitions/PL/scorers

Therefore we retrieve the scorer dataset and
sort it by:

player -> statistics -> goals -> assists
========================================================= */

exports.getTopAssists =
  async (req, res) => {
    try {
      if (
        !isPremierLeague(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,

          season: null,

          page: 1,

          limit: 20,

          total: 0,

          count: 0,

          players: [],

          message:
            "Top assists currently supported for Premier League only",
        });
      }

      const page =
        parseInt(
          req.query.page,
          10
        ) || 1;

      const limit =
        parseInt(
          req.query.limit,
          10
        ) || 20;

      const season =
        resolveFootballDataSeason(
          req.query.season
        );

      console.log(
        `🎯 Loading Premier League top assists | Season ${season}`
      );

      /* =============================================
         LOAD FOOTBALL-DATA SCORERS

         Assists are included in scorer records.
      ============================================= */

      const data =
        await footballDataGet(
          "/competitions/PL/scorers",
          {
            season,
          }
        );

      /* =============================================
         FORMAT PLAYERS
      ============================================= */

      const players =
        formatScorers(
          data
        );

      /* =============================================
         SORT BY ASSISTS

         Highest assists first.
      ============================================= */

      players.sort(
        (a, b) => {
          const assistsA =
            Number(
              a
                ?.statistics?.[0]
                ?.goals?.assists ||
              0
            );

          const assistsB =
            Number(
              b
                ?.statistics?.[0]
                ?.goals?.assists ||
              0
            );

          return (
            assistsB -
            assistsA
          );
        }
      );

      /* =============================================
         PAGINATION
      ============================================= */

      const total =
        players.length;

      const start =
        (page - 1) *
        limit;

      const end =
        start + limit;

      const paginatedPlayers =
        players.slice(
          start,
          end
        );

      console.log(
        `✅ Top assists loaded | Season ${season} | Total ${total} | Page ${page}`
      );

      return res.json({
        success: true,

        season,

        page,

        limit,

        total,

        count:
          paginatedPlayers.length,

        players:
          paginatedPlayers,

        source:
          "football-data.org",

        message:
          "Top assists loaded",
      });
    } catch (error) {
      console.error(
        "❌ getTopAssists football-data.org:",
        error.response?.data ||
          error.message
      );

      return res.status(500).json({
        success: false,

        season: null,

        page: 1,

        limit: 20,

        total: 0,

        count: 0,

        players: [],

        source:
          "football-data.org",

        message:
          "Unable to load Premier League top assists",

        error:
          error.response?.data ||
          error.message,
      });
    }
  };


/* =========================================================
GET TEAMS

/api/league/epl/teams

FULLY MIGRATED TO FOOTBALL-DATA.ORG
========================================================= */

exports.getTeams =
  async (req, res) => {
    try {
      if (
        !isPremierLeague(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,

          season: null,

          count: 0,

          teams: [],

          message:
            "Teams currently supported for Premier League only",
        });
      }

      const season =
        resolveFootballDataSeason(
          req.query.season
        );

      console.log(
        `🏟️ Loading Premier League teams | Season ${season}`
      );

      const teamsData =
        await getCompetitionTeams(
          "PL"
        );

      const teams =
        Array.isArray(
          teamsData
        )
          ? teamsData
              .map(formatTeam)
              .filter(Boolean)
          : [];

      console.log(
        `✅ Premier League teams loaded | ${teams.length} teams`
      );

      return res.json({
        success: true,

        season,

        league: {
          id:
            getPremierLeagueId(),

          code:
            "PL",

          name:
            "Premier League",
        },

        count:
          teams.length,

        teams,

        source:
          "football-data.org",

        message:
          "Premier League teams loaded",
      });
    } catch (error) {
      console.error(
        "❌ getTeams football-data.org:",
        error.response?.data ||
          error.message
      );

      return res.status(500).json({
        success: false,

        season: null,

        count: 0,

        teams: [],

        source:
          "football-data.org",

        message:
          "Unable to load Premier League teams",

        error:
          error.response?.data ||
          error.message,
      });
    }
  };


/* =========================================================
GET STATISTICS

/api/league/epl/statistics

FULLY MIGRATED TO FOOTBALL-DATA.ORG
========================================================= */

exports.getStatistics =
  async (req, res) => {
    try {
      if (
        !isPremierLeague(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,

          season: null,

          statistics: {},

          message:
            "Statistics currently supported for Premier League only",
        });
      }

      const season =
        resolveFootballDataSeason(
          req.query.season
        );

      console.log(
        `📊 Loading Premier League statistics | Season ${season}`
      );

      const data =
        await getPremierLeagueMatches({
          season,
        });

      let matches =
        Array.isArray(
          data?.matches
        )
          ? data.matches
          : [];

      /* =============================================
         ONLY MATCHES WITH FINAL SCORES
      ============================================= */

      matches =
        matches.filter(
          (match) => {
            const home =
              match.score
                ?.fullTime
                ?.home;

            const away =
              match.score
                ?.fullTime
                ?.away;

            return (
              typeof home ===
                "number" &&
              typeof away ===
                "number"
            );
          }
        );

      const stats = {
        matches: 0,

        goals: 0,

        homeGoals: 0,

        awayGoals: 0,

        homeWins: 0,

        awayWins: 0,

        draws: 0,

        cleanSheets: 0,

        avgGoals: 0,

        highestScoringMatch: 0,
      };

      /* =============================================
         CALCULATE STATISTICS
      ============================================= */

      matches.forEach(
        (match) => {
          const home =
            match.score
              ?.fullTime
              ?.home;

          const away =
            match.score
              ?.fullTime
              ?.away;

          if (
            typeof home !==
              "number" ||
            typeof away !==
              "number"
          ) {
            return;
          }

          const totalGoals =
            home + away;

          stats.matches++;

          stats.goals +=
            totalGoals;

          stats.homeGoals +=
            home;

          stats.awayGoals +=
            away;

          if (
            home > away
          ) {
            stats.homeWins++;
          } else if (
            away > home
          ) {
            stats.awayWins++;
          } else {
            stats.draws++;
          }

          if (
            home === 0 ||
            away === 0
          ) {
            stats.cleanSheets++;
          }

          if (
            totalGoals >
            stats.highestScoringMatch
          ) {
            stats.highestScoringMatch =
              totalGoals;
          }
        }
      );

      /* =============================================
         AVERAGE GOALS
      ============================================= */

      if (
        stats.matches > 0
      ) {
        stats.avgGoals =
          Number(
            (
              stats.goals /
              stats.matches
            ).toFixed(2)
          );
      }

      console.log(
        `✅ Premier League statistics loaded | Season ${season} | ${stats.matches} completed matches`
      );

      return res.json({
        success: true,

        season,

        statistics:
          stats,

        source:
          "football-data.org",

        message:
          "Premier League statistics loaded",
      });
    } catch (error) {
      console.error(
        "❌ getStatistics football-data.org:",
        error.response?.data ||
          error.message
      );

      return res.status(500).json({
        success: false,

        season: null,

        statistics: {},

        source:
          "football-data.org",

        message:
          "Unable to load Premier League statistics",

        error:
          error.response?.data ||
          error.message,
      });
    }
  };