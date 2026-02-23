const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

const router = express.Router();

const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = "https://v3.football.api-football.com";

/**
 * GET /api/match/:id
 * Returns ONE match object (or fallback)
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const response = await fetch(`${BASE_URL}/fixtures?id=${id}`, {
      headers: {
        "x-apisports-key": API_KEY,
      },
    });

    const data = await response.json();

    if (!response.ok || !data.response || data.response.length === 0) {
      throw new Error("No match found from API");
    }

    // ✅ Return SINGLE match
    res.json(data.response[0]);
  } catch (error) {
    console.error("Match API failed, using fallback:", error.message);

    // ✅ SAFE FALLBACK (unique per ID)
    res.json({
      fixture: {
        id: Number(id),
        status: { short: "NS" },
        date: new Date().toISOString(),
      },
      teams: {
        home: { name: `Team ${id}A` },
        away: { name: `Team ${id}B` },
      },
      goals: {
        home: 0,
        away: 0,
      },
    });
  }
});

module.exports = router;
