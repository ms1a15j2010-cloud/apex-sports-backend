const { apiGet } = require("../services/footballApi");

const formatPlayer = require("../formatters/playerFormatter");

/* =====================================================
   PLAYER PROFILE
===================================================== */

exports.getPlayer = async (req, res) => {
  try {
    const playerId = req.params.id;
    const season = req.query.season || 2023;

    const [
      playerResponse,
      transfersResponse,
      trophiesResponse,
    ] = await Promise.all([
      apiGet("/players", {
        id: playerId,
        season,
      }),

      apiGet("/transfers", {
        player: playerId,
      }),

      apiGet("/trophies", {
        player: playerId,
      }),
    ]);

    if (
      !Array.isArray(playerResponse) ||
      playerResponse.length === 0
    ) {
      return res.json({
        success: false,
        player: null,
        message: "Player not found",
      });
    }

    const player = formatPlayer({
      player: playerResponse[0],
      transfers: transfersResponse || [],
      trophies: trophiesResponse || [],
    });

    return res.json({
      success: true,
      player,
      message: "Player loaded",
    });

  } catch (err) {
    console.error("PlayerController:", err.message);

    return res.json({
      success: false,
      player: null,
      message: "Unable to load player",
    });
  }
};

/* =====================================================
   PLAYER STATISTICS
===================================================== */

exports.getStatistics = async (req, res) => {
  try {
    const season = req.query.season || 2023;

    const response = await apiGet("/players", {
      id: req.params.id,
      season,
    });

    return res.json({
      success: true,
      season,
      statistics: response,
      message: "Player statistics loaded",
    });

  } catch (err) {
    console.error("PlayerStatistics:", err.message);

    return res.status(500).json({
      success: false,
      statistics: [],
      message: "Unable to load player statistics",
    });
  }
};

/* =====================================================
   PLAYER TRANSFERS
===================================================== */

exports.getTransfers = async (req, res) => {
  try {
    const response = await apiGet("/transfers", {
      player: req.params.id,
    });

    return res.json({
      success: true,
      count: Array.isArray(response) ? response.length : 0,
      transfers: response || [],
      message: "Transfers loaded",
    });

  } catch (err) {
    console.error("PlayerTransfers:", err.message);

    return res.json({
      success: false,
      count: 0,
      transfers: [],
      message: "Unable to load transfers",
    });
  }
};

/* =====================================================
   PLAYER TROPHIES
===================================================== */

exports.getTrophies = async (req, res) => {
  try {
    const response = await apiGet("/trophies", {
      player: req.params.id,
    });

    return res.json({
      success: true,
      count: Array.isArray(response) ? response.length : 0,
      trophies: response || [],
      message: "Trophies loaded",
    });

  } catch (err) {
    console.error("PlayerTrophies:", err.message);

    return res.json({
      success: false,
      count: 0,
      trophies: [],
      message: "Unable to load trophies",
    });
  }
};

/* =====================================================
   PLAYER SEARCH
===================================================== */

exports.searchPlayers = async (req, res) => {
  try {
    const response = await apiGet("/players", {
      search: req.params.name,
      season: 2023,
    });

    return res.json({
      success: true,
      count: Array.isArray(response) ? response.length : 0,
      players: response || [],
      message: "Players loaded",
    });

  } catch (err) {
    console.error("PlayerSearch:", err.message);

    return res.status(500).json({
      success: false,
      count: 0,
      players: [],
      message: "Unable to search players",
    });
  }
};
/* =====================================================
   PLAYER CAREER
===================================================== */

exports.getCareer = async (req, res) => {
  try {
    const response = await apiGet("/players", {
      id: req.params.id,
      season: req.query.season || 2023,
    });

    const player =
      response?.[0] || null;

    return res.json({
      success: true,
      career:
        player?.statistics || [],
      message:
        "Career loaded",
    });

  } catch (err) {
    console.error(
      "PlayerCareer:",
      err.message
    );

    return res.status(500).json({
      success: false,
      career: [],
      message:
        "Unable to load career",
    });
  }
};

/* =====================================================
   PLAYER PERFORMANCE
===================================================== */

exports.getPerformance =
  async (req, res) => {
    try {
      const response =
        await apiGet(
          "/players",
          {
            id: req.params.id,
            season:
              req.query
                .season ||
              2023,
          }
        );

      const player =
        response?.[0] || null;

      return res.json({
        success: true,
        performance:
          player?.statistics ||
          [],
      });

    } catch (err) {
      console.error(
        "PlayerPerformance:",
        err.message
      );

      return res
        .status(500)
        .json({
          success: false,
          performance: [],
        });
    }
  };

/* =====================================================
   PLAYER FIXTURES
===================================================== */

exports.getFixtures =
  async (req, res) => {
    try {
      const fixtures =
        await apiGet(
          "/fixtures",
          {
            player:
              req.params.id,
            season:
              req.query
                .season ||
              2023,
            next: 10,
          }
        );

      return res.json({
        success: true,
        fixtures,
      });

    } catch (err) {
      console.error(
        "PlayerFixtures:",
        err.message
      );

      return res
        .status(500)
        .json({
          success: false,
          fixtures: [],
        });
    }
  };

/* =====================================================
   PLAYER HISTORY
===================================================== */

exports.getHistory =
  async (req, res) => {
    try {
      const fixtures =
        await apiGet(
          "/fixtures",
          {
            player:
              req.params.id,
            season:
              req.query
                .season ||
              2023,
            last: 20,
          }
        );

      return res.json({
        success: true,
        history:
          fixtures || [],
      });

    } catch (err) {
      console.error(
        "PlayerHistory:",
        err.message
      );

      return res
        .status(500)
        .json({
          success: false,
          history: [],
        });
    }
  };