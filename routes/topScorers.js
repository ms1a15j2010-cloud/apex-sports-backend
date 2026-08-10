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

const demoPlayers = [
  {
    player: {
      id: 1,
      name: "Erling Haaland",
      age: 25,
      photo: "https://media.api-sports.io/football/players/1100.png",
    },
    statistics: [
      {
        team: {
          id: 50,
          name: "Manchester City",
          logo: "https://media.api-sports.io/football/teams/50.png",
        },
        games: {
          appearences: 38,
        },
        goals: {
          total: 31,
          assists: 7,
        },
      },
    ],
  },
  {
    player: {
      id: 2,
      name: "Harry Kane",
      age: 32,
      photo: "https://media.api-sports.io/football/players/882.png",
    },
    statistics: [
      {
        team: {
          id: 157,
          name: "Bayern Munich",
          logo: "https://media.api-sports.io/football/teams/157.png",
        },
        games: {
          appearences: 34,
        },
        goals: {
          total: 29,
          assists: 8,
        },
      },
    ],
  },
  {
    player: {
      id: 3,
      name: "Kylian Mbappe",
      age: 27,
      photo: "https://media.api-sports.io/football/players/278.png",
    },
    statistics: [
      {
        team: {
          id: 541,
          name: "Real Madrid",
          logo: "https://media.api-sports.io/football/teams/541.png",
        },
        games: {
          appearences: 36,
        },
        goals: {
          total: 28,
          assists: 10,
        },
      },
    ],
  },
  {
    player: {
      id: 4,
      name: "Mohamed Salah",
      age: 34,
      photo: "https://media.api-sports.io/football/players/306.png",
    },
    statistics: [
      {
        team: {
          id: 40,
          name: "Liverpool",
          logo: "https://media.api-sports.io/football/teams/40.png",
        },
        games: {
          appearences: 37,
        },
        goals: {
          total: 24,
          assists: 13,
        },
      },
    ],
  },
  {
    player: {
      id: 5,
      name: "Robert Lewandowski",
      age: 37,
      photo: "https://media.api-sports.io/football/players/521.png",
    },
    statistics: [
      {
        team: {
          id: 529,
          name: "Barcelona",
          logo: "https://media.api-sports.io/football/teams/529.png",
        },
        games: {
          appearences: 35,
        },
        goals: {
          total: 23,
          assists: 5,
        },
      },
    ],
  },
];

router.get("/:league", async (req, res) => {
  try {
    const { league } = req.params;

    const leagueId =
      LEAGUES[league.toLowerCase()] || Number(league);

    if (!leagueId) {
      return res.json({
        success: false,
        message: "League not found",
        players: demoPlayers,
        mock: true,
      });
    }

    const response = await axios.get(
      `https://${API_HOST}/players/topscorers`,
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

    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.errors?.requests) {
      return res.json({
        success: true,
        mock: true,
        message: "Daily API request limit reached.",
        players: demoPlayers,
      });
    }

    if (response.data.errors?.plan) {
      return res.json({
        success: true,
        mock: true,
        message: "Season not available on Free plan.",
        players: demoPlayers,
      });
    }

    const players = response.data.response || [];

    if (!players.length) {
      return res.json({
        success: true,
        mock: true,
        message: "No players returned.",
        players: demoPlayers,
      });
    }

    return res.json({
      success: true,
      mock: false,
      players,
    });

  } catch (err) {

    console.error(
      "TOP SCORERS ERROR:",
      err.response?.data || err.message
    );

    return res.json({
      success: true,
      mock: true,
      message: "Using fallback players.",
      players: demoPlayers,
    });

  }
});

module.exports = router;