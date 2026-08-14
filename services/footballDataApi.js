const axios = require("axios");

/* =====================================================
FOOTBALL-DATA.ORG SERVICE

This service communicates with:

https://api.football-data.org/v4

It replaces the old API-Football service for migrated
features.
===================================================== */

const API_BASE =
  "https://api.football-data.org/v4";

/* =====================================================
API TOKEN
===================================================== */

const API_TOKEN =
  process.env.FOOTBALL_DATA_API_TOKEN;

/* =====================================================
DEFAULT REQUEST SETTINGS
===================================================== */

const DEFAULT_TIMEOUT = 30000;

/* =====================================================
SEARCH CACHE
===================================================== */

const SEARCH_CACHE_TTL =
  5 * 60 * 1000;

const searchCache = new Map();

/* =====================================================
TOP SCORERS CACHE
===================================================== */

const TOP_SCORERS_CACHE_TTL =
  5 * 60 * 1000;

const topScorersCache =
  new Map();

/* =====================================================
FIXTURES CACHE
===================================================== */

const FIXTURES_CACHE_TTL =
  5 * 60 * 1000;

const fixturesCache =
  new Map();

/* =====================================================
MATCH CACHE

Single-match requests are cached so repeated Match
Center requests do not repeatedly hit the provider.
===================================================== */

const MATCH_CACHE_TTL =
  5 * 60 * 1000;

const matchCache =
  new Map();

/* =====================================================
HEAD-TO-HEAD CACHE
===================================================== */

const HEAD_TO_HEAD_CACHE_TTL =
  5 * 60 * 1000;

const headToHeadCache =
  new Map();

/* =====================================================
SUPPORTED SEARCH COMPETITIONS
===================================================== */

const SEARCH_COMPETITIONS = [
  "PL",
  "PD",
  "BL1",
  "SA",
  "FL1",
];

/* =====================================================
MAIN FOOTBALL-DATA.ORG REQUEST

options.headers may be supplied for special
football-data.org headers.

Examples:

X-Unfold-Lineups
X-Unfold-Goals
X-Unfold-Bookings
X-Unfold-Subs
===================================================== */

async function footballDataGet(
  endpoint,
  params = {},
  options = {}
) {
  if (!API_TOKEN) {
    console.error(
      "❌ FOOTBALL_DATA_API_TOKEN is missing"
    );

    throw new Error(
      "FOOTBALL_DATA_API_TOKEN is missing"
    );
  }

  try {
    console.log(
      `🌍 Football-data.org request: ${endpoint}`
    );

    console.log(
      "Football-data.org params:",
      params
    );

    const response =
      await axios.get(
        `${API_BASE}${endpoint}`,
        {
          params,

          timeout:
            DEFAULT_TIMEOUT,

          headers: {
            "X-Auth-Token":
              API_TOKEN,

            ...(options.headers ||
              {}),
          },
        }
      );

    console.log(
      "✅ Football-data.org status:",
      response.status
    );

    return response.data || {};
  } catch (error) {
    console.error(
      "❌ Football-data.org API error:",
      error.response?.status ||
        error.message
    );

    if (
      error.response?.data
    ) {
      console.error(
        "Football-data.org response:",
        error.response.data
      );
    }

    throw error;
  }
}

/* =====================================================
PREMIER LEAGUE MATCHES

Cached for 5 minutes.

The cache key contains the request parameters.
===================================================== */

async function getPremierLeagueMatches(
  params = {}
) {
  const cacheKey =
    JSON.stringify({
      competition: "PL",
      ...params,
    });

  const cached =
    fixturesCache.get(
      cacheKey
    );

  if (cached) {
    const age =
      Date.now() -
      cached.timestamp;

    if (
      age <
      FIXTURES_CACHE_TTL
    ) {
      console.log(
        `✅ Fixtures cache hit: ${cacheKey}`
      );

      return cached.data;
    }

    fixturesCache.delete(
      cacheKey
    );
  }

  console.log(
    `🌐 Fetching fresh Premier League fixtures: ${cacheKey}`
  );

  const data =
    await footballDataGet(
      "/competitions/PL/matches",
      params
    );

  fixturesCache.set(
    cacheKey,
    {
      data,

      timestamp:
        Date.now(),
    }
  );

  return data;
}

/* =====================================================
LIVE MATCHES
===================================================== */

async function getLiveMatches() {
  const today =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          "Asia/Karachi",

        year: "numeric",

        month: "2-digit",

        day: "2-digit",
      }
    ).format(new Date());

  console.log(
    "📅 Football-data.org live date:",
    today
  );

  const data =
    await footballDataGet(
      "/matches",
      {
        date: today,
      }
    );

  const matches =
    Array.isArray(
      data?.matches
    )
      ? data.matches
      : [];

  const liveMatches =
    matches.filter(
      (match) =>
        match.status ===
          "IN_PLAY" ||
        match.status ===
          "PAUSED"
    );

  console.log(
    `🔴 Football-data.org live matches: ${liveMatches.length}`
  );

  return liveMatches;
}

/* =====================================================
FINISHED MATCHES
===================================================== */

async function getFinishedMatches(
  params = {}
) {
  const data =
    await getPremierLeagueMatches({
      ...params,

      status: "FINISHED",
    });

  return Array.isArray(
    data?.matches
  )
    ? data.matches
    : [];
}

/* =====================================================
SCHEDULED MATCHES
===================================================== */

async function getScheduledMatches(
  params = {}
) {
  const data =
    await getPremierLeagueMatches({
      ...params,

      status: "SCHEDULED",
    });

  return Array.isArray(
    data?.matches
  )
    ? data.matches
    : [];
}

/* =====================================================
GET FIXTURES
===================================================== */

async function getFixtures(
  params = {}
) {
  const data =
    await getPremierLeagueMatches(
      params
    );

  return Array.isArray(
    data?.matches
  )
    ? data.matches
    : [];
}

/* =====================================================
GET SINGLE MATCH

Used by:

/api/match/:id

The request includes unfold headers.
===================================================== */

async function getMatch(
  matchId
) {
  if (!matchId) {
    throw new Error(
      "Match ID is required"
    );
  }

  const cacheKey =
    `match:${String(matchId)}:full`;

  const cached =
    matchCache.get(
      cacheKey
    );

  if (cached) {
    const age =
      Date.now() -
      cached.timestamp;

    if (
      age <
      MATCH_CACHE_TTL
    ) {
      console.log(
        `✅ Match cache hit: ${matchId}`
      );

      return cached.data;
    }

    matchCache.delete(
      cacheKey
    );
  }

  console.log(
    `🌐 Fetching fresh full match: ${matchId}`
  );

  const data =
    await footballDataGet(
      `/matches/${encodeURIComponent(
        matchId
      )}`,
      {},
      {
        headers: {
          "X-Unfold-Lineups":
            "true",

          "X-Unfold-Goals":
            "true",

          "X-Unfold-Bookings":
            "true",

          "X-Unfold-Subs":
            "true",
        },
      }
    );

  matchCache.set(
    cacheKey,
    {
      data,

      timestamp:
        Date.now(),
    }
  );

  return data;
}

/* =====================================================
GET COMPETITION
===================================================== */

async function getCompetition(
  competition = "PL"
) {
  return footballDataGet(
    `/competitions/${competition}`
  );
}

/* =====================================================
GET ALL COMPETITIONS
===================================================== */

async function getCompetitions(
  params = {}
) {
  const data =
    await footballDataGet(
      "/competitions",
      params
    );

  return Array.isArray(
    data?.competitions
  )
    ? data.competitions
    : [];
}

/* =====================================================
GET COMPETITION TEAMS
===================================================== */

async function getCompetitionTeams(
  competition = "PL",
  params = {}
) {
  const data =
    await footballDataGet(
      `/competitions/${competition}/teams`,
      params
    );

  return Array.isArray(
    data?.teams
  )
    ? data.teams
    : [];
}

/* =====================================================
GET COMPETITION TOP SCORERS

Cached for 5 minutes.
===================================================== */

async function getCompetitionScorers(
  competition = "PL",
  params = {}
) {
  const season =
    params?.season ?? "";

  const limit =
    params?.limit ?? 20;

  const cacheKey =
    `${competition}:${season}:${limit}`;

  const cached =
    topScorersCache.get(
      cacheKey
    );

  if (cached) {
    const age =
      Date.now() -
      cached.timestamp;

    if (
      age <
      TOP_SCORERS_CACHE_TTL
    ) {
      console.log(
        `✅ Top scorers cache hit: ${cacheKey}`
      );

      return cached.data;
    }

    topScorersCache.delete(
      cacheKey
    );
  }

  console.log(
    `🌐 Fetching fresh top scorers: ${cacheKey}`
  );

  const data =
    await footballDataGet(
      `/competitions/${competition}/scorers`,
      {
        season,

        limit,
      }
    );

  const scorers =
    Array.isArray(
      data?.scorers
    )
      ? data.scorers
      : [];

  topScorersCache.set(
    cacheKey,
    {
      data: scorers,

      timestamp:
        Date.now(),
    }
  );

  return scorers;
}

/* =====================================================
GET TEAM
===================================================== */

async function getTeam(
  teamId
) {
  return footballDataGet(
    `/teams/${teamId}`
  );
}

/* =====================================================
GET TEAM SQUAD
===================================================== */

async function getTeamSquad(
  teamId
) {
  const data =
    await footballDataGet(
      `/teams/${teamId}`
    );

  return Array.isArray(
    data?.squad
  )
    ? data.squad
    : [];
}

/* =====================================================
GET TEAM MATCHES
===================================================== */

async function getTeamMatches(
  teamId,
  params = {}
) {
  if (!teamId) {
    throw new Error(
      "Team ID is required"
    );
  }

  const data =
    await footballDataGet(
      `/teams/${teamId}/matches`,
      params
    );

  return Array.isArray(
    data?.matches
  )
    ? data.matches
    : [];
}

/* =====================================================
GET HEAD-TO-HEAD

football-data.org does not provide the old API-Football:

/fixtures/headtohead

Instead we search the Premier League competition
matches by season and filter for the requested teams.

This is more reliable for historical H2H data than
depending only on the current team-match feed.

The function:

1. Searches the requested/current season.
2. Searches previous seasons if necessary.
3. Filters by both team IDs.
4. Sorts newest first.
5. Removes duplicate matches.
6. Returns up to the requested limit.
7. Caches the result for 5 minutes.
===================================================== */

async function getHeadToHead(
  homeTeamId,
  awayTeamId,
  params = {}
) {
  if (
    !homeTeamId ||
    !awayTeamId
  ) {
    throw new Error(
      "Both home and away team IDs are required"
    );
  }

  const homeId =
    Number(homeTeamId);

  const awayId =
    Number(awayTeamId);

  if (
    !Number.isInteger(
      homeId
    ) ||
    !Number.isInteger(
      awayId
    ) ||
    homeId <= 0 ||
    awayId <= 0
  ) {
    throw new Error(
      "Invalid home or away team ID"
    );
  }

  /* =================================================
  REQUESTED SEASON
  ================================================= */

  const requestedSeason =
    Number(
      params?.season
    );

  const validRequestedSeason =
    Number.isInteger(
      requestedSeason
    ) &&
    requestedSeason >= 1900 &&
    requestedSeason <= 2100
      ? requestedSeason
      : null;

  /* =================================================
  CURRENT YEAR
  ================================================= */

  const currentYear =
    new Date().getFullYear();

  const startingSeason =
    validRequestedSeason ||
    currentYear;

  /* =================================================
  SEASONS TO SEARCH

  Example:

  2026
  2025
  2024
  2023
  2022
  2021
  ================================================= */

  const seasons = [
    startingSeason,
    startingSeason - 1,
    startingSeason - 2,
    startingSeason - 3,
    startingSeason - 4,
    startingSeason - 5,
  ];

  /* =================================================
  RESULT LIMIT
  ================================================= */

  const requestedLimit =
    Number(
      params?.limit
    ) || 10;

  const limit =
    Math.min(
      Math.max(
        requestedLimit,
        1
      ),
      20
    );

  /* =================================================
  CACHE KEY
  ================================================= */

  const cacheKey =
    `h2h:${homeId}:${awayId}:${
      validRequestedSeason ||
      "auto"
    }:${limit}`;

  const cached =
    headToHeadCache.get(
      cacheKey
    );

  if (cached) {
    const age =
      Date.now() -
      cached.timestamp;

    if (
      age <
      HEAD_TO_HEAD_CACHE_TTL
    ) {
      console.log(
        `✅ H2H cache hit: ${cacheKey}`
      );

      return cached.data;
    }

    headToHeadCache.delete(
      cacheKey
    );
  }

  /* =================================================
  COLLECT MATCHES
  ================================================= */

  const h2hMatches = [];

  const seasonsUsed = [];

  for (
    const season of seasons
  ) {
    try {
      console.log(
        `🔎 H2H Premier League search | ${homeId} vs ${awayId} | season ${season}`
      );

      const data =
        await getPremierLeagueMatches({
          season,

          status:
            "FINISHED",

          limit: 500,
        });

      const matches =
        Array.isArray(
          data?.matches
        )
          ? data.matches
          : [];

      /* =============================================
      FILTER MATCHES BETWEEN REQUESTED TEAMS
      ============================================= */

      const seasonH2H =
        matches.filter(
          (match) => {
            const matchHomeId =
              match.homeTeam?.id;

            const matchAwayId =
              match.awayTeam?.id;

            const direct =
              Number(
                matchHomeId
              ) === homeId &&
              Number(
                matchAwayId
              ) === awayId;

            const reverse =
              Number(
                matchHomeId
              ) === awayId &&
              Number(
                matchAwayId
              ) === homeId;

            return (
              direct ||
              reverse
            );
          }
        );

      if (
        seasonH2H.length > 0
      ) {
        h2hMatches.push(
          ...seasonH2H
        );

        seasonsUsed.push(
          season
        );
      }

      /* =============================================
      STOP IF ENOUGH MATCHES FOUND
      ============================================= */

      if (
        h2hMatches.length >=
        limit
      ) {
        break;
      }
    } catch (error) {
      console.warn(
        `⚠️ H2H season ${season} failed:`,
        error.response?.status ||
          error.message
      );

      /*
       * Continue searching previous seasons.
       */
    }
  }

  /* =================================================
  SORT NEWEST FIRST
  ================================================= */

  h2hMatches.sort(
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
        dateB - dateA
      );
    }
  );

  /* =================================================
  REMOVE DUPLICATES
  ================================================= */

  const uniqueMatches =
    Array.from(
      new Map(
        h2hMatches.map(
          (match) => [
            match.id,
            match,
          ]
        )
      ).values()
    );

  /* =================================================
  FINAL RESULT
  ================================================= */

  const result =
    uniqueMatches.slice(
      0,
      limit
    );

  const response = {
    matches:
      result,

    requestedSeason:
      validRequestedSeason,

    season:
      seasonsUsed.length > 0
        ? seasonsUsed[
            seasonsUsed.length - 1
          ]
        : null,

    seasonsUsed,
  };

  /* =================================================
  CACHE
  ================================================= */

  headToHeadCache.set(
    cacheKey,
    {
      data:
        response,

      timestamp:
        Date.now(),
    }
  );

  console.log(
    `✅ H2H complete | ${homeId} vs ${awayId} | matches: ${result.length} | seasons: ${
      seasonsUsed.join(", ") ||
      "none"
    }`
  );

  return response;
}

/* =====================================================
GET PERSON
===================================================== */

async function getPerson(
  personId
) {
  return footballDataGet(
    `/persons/${personId}`
  );
}

/* =====================================================
GET PERSON MATCHES
===================================================== */

async function getPersonMatches(
  personId,
  params = {}
) {
  const data =
    await footballDataGet(
      `/persons/${personId}/matches`,
      params
    );

  return Array.isArray(
    data?.matches
  )
    ? data.matches
    : [];
}

/* =====================================================
SEARCH CACHE HELPERS
===================================================== */

function getCachedSearch(
  key
) {
  const cached =
    searchCache.get(
      key
    );

  if (!cached) {
    return null;
  }

  const age =
    Date.now() -
    cached.timestamp;

  if (
    age >
    SEARCH_CACHE_TTL
  ) {
    searchCache.delete(
      key
    );

    return null;
  }

  return cached.data;
}

function setCachedSearch(
  key,
  data
) {
  searchCache.set(
    key,
    {
      data,

      timestamp:
        Date.now(),
    }
  );
}

/* =====================================================
GLOBAL SEARCH
===================================================== */

async function searchFootball(
  query
) {
  const term =
    String(query || "")
      .trim()
      .toLowerCase();

  if (!term) {
    return {
      teams: [],
      players: [],
      leagues: [],
      matches: [],
    };
  }

  const cacheKey =
    term;

  const cached =
    getCachedSearch(
      cacheKey
    );

  if (cached) {
    console.log(
      `✅ Search cache hit: "${query}"`
    );

    return cached;
  }

  console.log(
    `🔎 football-data.org search: "${query}"`
  );

  /* =================================================
  COMPETITION SEARCH
  ================================================= */

  let competitions = [];

  try {
    const allCompetitions =
      await getCompetitions();

    competitions =
      allCompetitions.filter(
        (competition) => {
          const name =
            String(
              competition?.name ||
                ""
            ).toLowerCase();

          const code =
            String(
              competition?.code ||
                ""
            ).toLowerCase();

          const area =
            String(
              competition?.area
                ?.name || ""
            ).toLowerCase();

          return (
            name.includes(
              term
            ) ||
            code.includes(
              term
            ) ||
            area.includes(
              term
            )
          );
        }
      );
  } catch (error) {
    console.warn(
      "⚠️ Competition search failed:",
      error.message
    );
  }

  /* =================================================
  TEAM + PLAYER SEARCH
  ================================================= */

  const teamsMap =
    new Map();

  const playersMap =
    new Map();

  await Promise.all(
    SEARCH_COMPETITIONS.map(
      async (
        competitionCode
      ) => {
        try {
          const teams =
            await getCompetitionTeams(
              competitionCode
            );

          for (
            const team of teams
          ) {
            if (!team) {
              continue;
            }

            const teamName =
              String(
                team?.name || ""
              ).toLowerCase();

            const shortName =
              String(
                team?.shortName ||
                  ""
              ).toLowerCase();

            const tla =
              String(
                team?.tla || ""
              ).toLowerCase();

            const teamMatches =
              teamName.includes(
                term
              ) ||
              shortName.includes(
                term
              ) ||
              tla === term;

            if (
              teamMatches &&
              team.id != null
            ) {
              teamsMap.set(
                team.id,
                team
              );
            }

            if (
              Array.isArray(
                team?.squad
              )
            ) {
              for (
                const player of
                  team.squad
              ) {
                if (!player) {
                  continue;
                }

                const playerName =
                  String(
                    player?.name ||
                      ""
                  ).toLowerCase();

                const firstName =
                  String(
                    player?.firstName ||
                      ""
                  ).toLowerCase();

                const lastName =
                  String(
                    player?.lastName ||
                      ""
                  ).toLowerCase();

                if (
                  playerName.includes(
                    term
                  ) ||
                  firstName.includes(
                    term
                  ) ||
                  lastName.includes(
                    term
                  )
                ) {
                  playersMap.set(
                    player.id,
                    {
                      player,

                      team: {
                        id:
                          team.id,

                        name:
                          team.name,

                        shortName:
                          team.shortName,

                        tla:
                          team.tla,

                        crest:
                          team.crest,
                      },
                    }
                  );
                }
              }
            }
          }
        } catch (error) {
          console.warn(
            `⚠️ Search competition ${competitionCode} failed:`,
            error.response?.status ||
              error.message
          );
        }
      }
    )
  );

  /* =================================================
  RESULT

  Match search intentionally remains empty to avoid
  wasting provider quota.
  ================================================= */

  const result = {
    teams: [
      ...teamsMap.values(),
    ].slice(0, 20),

    players: [
      ...playersMap.values(),
    ].slice(0, 20),

    leagues:
      competitions.slice(
        0,
        20
      ),

    matches: [],
  };

  setCachedSearch(
    cacheKey,
    result
  );

  console.log(
    `✅ Search complete: "${query}"`,
    {
      teams:
        result.teams.length,

      players:
        result.players.length,

      leagues:
        result.leagues.length,

      matches:
        result.matches.length,
    }
  );

  return result;
}

/* =====================================================
EXPORTS
===================================================== */

module.exports = {
  footballDataGet,

  getPremierLeagueMatches,

  getLiveMatches,

  getFinishedMatches,

  getScheduledMatches,

  getFixtures,

  getMatch,

  getCompetition,

  getCompetitions,

  getCompetitionTeams,

  getCompetitionScorers,

  getTeam,

  getTeamSquad,

  getTeamMatches,

  getHeadToHead,

  getPerson,

  getPersonMatches,

  searchFootball,
};