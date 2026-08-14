const {
  footballDataGet,
} = require("../services/footballDataApi");

/* =====================================================
LEAGUE MAP
===================================================== */

const LEAGUE_MAP = {
  epl: "PL",
  premierleague: "PL",
  "premier-league": "PL",

  laliga: "PD",
  "la-liga": "PD",

  bundesliga: "BL1",

  seriea: "SA",
  "serie-a": "SA",

  ligue1: "FL1",
  "ligue-1": "FL1",

  primeiraliga: "PPL",
  "primeira-liga": "PPL",

  /* Old API-Football IDs */
  39: "PL",
  140: "PD",
  78: "BL1",
  135: "SA",
  61: "FL1",
};

/* =====================================================
LEAGUE NAMES
===================================================== */

const LEAGUE_NAMES = {
  PL: "Premier League",
  PD: "La Liga",
  BL1: "Bundesliga",
  SA: "Serie A",
  FL1: "Ligue 1",
  PPL: "Primeira Liga",
};

/* =====================================================
RESOLVE LEAGUE
===================================================== */

function resolveCompetition(
  value
) {
  const key = String(
    value || ""
  )
    .trim()
    .toLowerCase();

  if (!key) {
    return null;
  }

  if (LEAGUE_MAP[key]) {
    return LEAGUE_MAP[key];
  }

  if (
    /^[a-z]{2,4}$/i.test(
      key
    )
  ) {
    return key.toUpperCase();
  }

  return null;
}

/* =====================================================
RESOLVE SEASON

2024 => 2024/25
2025 => 2025/26
2026 => 2026/27
===================================================== */

function resolveSeason(
  requestedSeason
) {
  if (
    requestedSeason !== undefined &&
    requestedSeason !== null &&
    String(requestedSeason).trim() !== ""
  ) {
    const season =
      Number(requestedSeason);

    if (
      Number.isInteger(season) &&
      season >= 2000 &&
      season <= 2100
    ) {
      return season;
    }
  }

  return 2025;
}

/* =====================================================
NORMALIZE TEAM
===================================================== */

function normalizeTeam(
  team
) {
  if (!team) {
    return {
      id: null,
      name: "Unknown Team",
      shortName: null,
      tla: null,
      logo: null,
    };
  }

  return {
    id:
      team.id ??
      null,

    name:
      team.name ||
      team.shortName ||
      "Unknown Team",

    shortName:
      team.shortName ||
      null,

    tla:
      team.tla ||
      null,

    logo:
      team.crest ||
      null,
  };
}

/* =====================================================
NORMALIZE STANDING
===================================================== */

function normalizeStanding(
  club
) {
  const team =
    normalizeTeam(
      club?.team
    );

  return {
    rank:
      club?.position ??
      0,

    team,

    all: {
      played:
        club?.playedGames ??
        0,

      win:
        club?.won ??
        0,

      draw:
        club?.draw ??
        0,

      lose:
        club?.lost ??
        0,

      goals: {
        for:
          club?.goalsFor ??
          0,

        against:
          club?.goalsAgainst ??
          0,
      },
    },

    goalsDiff:
      club?.goalDifference ??
      0,

    points:
      club?.points ??
      0,

    form:
      club?.form ||
      null,

    position:
      club?.position ??
      0,

    playedGames:
      club?.playedGames ??
      0,

    won:
      club?.won ??
      0,

    draw:
      club?.draw ??
      0,

    lost:
      club?.lost ??
      0,

    goalsFor:
      club?.goalsFor ??
      0,

    goalsAgainst:
      club?.goalsAgainst ??
      0,

    goalDifference:
      club?.goalDifference ??
      0,
  };
}

/* =====================================================
GET STANDINGS
===================================================== */

exports.getStandings =
  async (
    req,
    res
  ) => {
    try {
      const competition =
        resolveCompetition(
          req.params.id
        );

      if (!competition) {
        return res.status(
          404
        ).json({
          success: false,
          count: 0,
          standings: [],
          league: null,
          season: null,
          message:
            `Unsupported league: ${req.params.id || ""}`,
        });
      }

      const season =
        resolveSeason(
          req.query.season
        );

      const leagueName =
        LEAGUE_NAMES[
          competition
        ] ||
        competition;

      console.log(
        "======================================"
      );

      console.log(
        "📊 STANDINGS"
      );

      console.log(
        "Competition:",
        competition
      );

      console.log(
        "Season:",
        season
      );

      console.log(
        "======================================"
      );

      /* =============================================
      FOOTBALL-DATA.ORG
      ============================================= */

      const data =
        await footballDataGet(
          `/competitions/${competition}/standings`,
          {
            season,
          }
        );

      /* =============================================
      FIND TOTAL TABLE
      ============================================= */

      const standingsGroups =
        Array.isArray(
          data?.standings
        )
          ? data.standings
          : [];

      const totalStanding =
        standingsGroups.find(
          (item) =>
            String(
              item?.type || ""
            ).toUpperCase() ===
            "TOTAL"
        ) ||
        standingsGroups[0] ||
        null;

      const table =
        Array.isArray(
          totalStanding?.table
        )
          ? totalStanding.table
          : [];

      if (
        table.length === 0
      ) {
        console.warn(
          `⚠️ No standings table | ${competition} | ${season}`
        );

        return res.json({
          success: false,

          count: 0,

          standings: [],

          league: {
            id:
              competition,

            name:
              data?.competition
                ?.name ||
              leagueName,

            logo:
              data?.competition
                ?.emblem ||
              null,

            country:
              data?.area?.name ||
              null,

            season,
          },

          season,

          message:
            "No standings available",
        });
      }

      /* =============================================
      NORMALIZE
      ============================================= */

      const standings =
        table
          .map(
            normalizeStanding
          );

      console.log(
        `✅ ${leagueName} standings loaded | Season ${season} | ${standings.length} teams`
      );

      /* =============================================
      RESPONSE
      ============================================= */

      return res.json({
        success: true,

        league: {
          id:
            competition,

          name:
            data?.competition
              ?.name ||
            leagueName,

          code:
            data?.competition
              ?.code ||
            competition,

          logo:
            data?.competition
              ?.emblem ||
            null,

          country:
            data?.area?.name ||
            null,

          areaCode:
            data?.area?.code ||
            null,

          season,
        },

        season,

        count:
          standings.length,

        standings,

        message:
          "Standings loaded",
      });
    } catch (error) {
      console.error(
        "❌ StandingsController:",
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

          count: 0,

          standings: [],

          league: null,

          season:
            resolveSeason(
              req.query.season
            ),

          apiLimitReached:
            true,

          message:
            "Football-data.org request limit reached. Please try again later.",
        });
      }

      return res.status(
        error.response?.status >=
          400 &&
        error.response?.status <
          600
          ? error.response.status
          : 500
      ).json({
        success: false,

        count: 0,

        standings: [],

        league: null,

        season:
          resolveSeason(
            req.query.season
          ),

        message:
          "Unable to load standings",

        error:
          error.response?.data ||
          error.message,
      });
    }
  };