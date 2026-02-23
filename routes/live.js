const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

const router = express.Router();
const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = "https://v3.football.api-football.com";

// GET /api/live
router.get("/", async (req, res) => {
  try {
    if (!API_KEY) {
      console.warn("API_FOOTBALL_KEY missing in .env, returning fallback data.");
      throw new Error("Missing API key");
    }

    const response = await fetch(`${BASE_URL}/fixtures?live=all`, {
      headers: { "x-apisports-key": API_KEY },
    });

    const data = await response.json();

    // If API returns error or no data, fallback
    if (!response.ok || !data.response || data.response.length === 0) {
      console.warn("Live matches API returned empty or error, using fallback data.");
      return res.json({
        response: [
          {
            fixture: { id: 1 },
            teams: { home: { name: "Team A" }, away: { name: "Team B" } },
            goals: { home: 0, away: 0 },
            league: { name: "Test League" },
            status: { long: "Not Started", short: "NS" },
          },
          {
            fixture: { id: 2 },
            teams: { home: { name: "Team C" }, away: { name: "Team D" } },
            goals: { home: 0, away: 0 },
            league: { name: "Test League" },
            status: { long: "Not Started", short: "NS" },
          },
        ],
      });
    }

    res.json(data);
  } catch (err) {
    console.error("Fetch error /api/live:", err.message);

    // Fallback matches if API unreachable
    res.json({
      response: [
        {
          fixture: { id: 1 },
          teams: { home: { name: "Team A" }, away: { name: "Team B" } },
          goals: { home: 0, away: 0 },
          league: { name: "Test League" },
          status: { long: "Not Started", short: "NS" },
        },
        {
          fixture: { id: 2 },
          teams: { home: { name: "Team C" }, away: { name: "Team D" } },
          goals: { home: 0, away: 0 },
          league: { name: "Test League" },
          status: { long: "Not Started", short: "NS" },
        },
      ],
    });
  }
});

module.exports = router;
