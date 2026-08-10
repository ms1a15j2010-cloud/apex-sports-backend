const express = require("express");
const axios = require("axios");

const router = express.Router();

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_HOST = process.env.API_HOST;

const LEAGUES = {
  epl: 39,
  laliga: 140,
  "la-liga": 140,
  bundesliga: 78,
  seriea: 135,
  "serie-a": 135,
  ligue1: 61,
  "ligue-1": 61,
  championsleague: 2,
  "champions-league": 2,
  europa: 3,
  "europa-league": 3,
};

// GET /api/standings/:league
router.get("/:league", async (req, res) => {
  try {
    const { league } = req.params;

    // Accept both names (epl) and ids (39)
    const leagueId =
      LEAGUES[league.toLowerCase()] || Number(league);

    if (!leagueId) {
      return res.json({
        success: false,
        message: "League not found",
      });
    }

    const response = await axios.get(
      `https://${API_HOST}/standings`,
      {
        headers: {
          "x-apisports-key": API_KEY,
          "x-apisports-host": API_HOST,
        },
        params: {
          league: leagueId,
          season: 2024,
        },
      }
    );

    if (!response.data.response.length) {
      return res.json({
        success: false,
        message: "No standings found",
      });
    }

    const leagueInfo = response.data.response[0].league;

    res.json({
      success: true,

      league: {
        id: leagueInfo.id,
        name: leagueInfo.name,
        country: leagueInfo.country,
        logo: leagueInfo.logo,
        flag: leagueInfo.flag,
        season: leagueInfo.season,
      },

      standings: leagueInfo.standings[0],
    });

  } catch (err) {
    console.error(
      "STANDINGS ERROR:",
      err.response?.data || err.message
    );

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = router;