const express = require("express");
const router = express.Router();

const {
  getFixtures,
} = require("../controllers/fixturesController");

// GET /api/fixtures/:league
router.get("/:league", getFixtures);

module.exports = router;