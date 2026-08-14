const express = require("express");

const {
  getFixtures,
} = require(
  "../controllers/fixturesController"
);

const router =
  express.Router();

/* =====================================================
FIXTURES ROUTES

GET:

/api/fixtures/epl

/api/fixtures/epl?season=2025

/api/fixtures/epl?page=1&limit=10

/api/fixtures/epl?season=2025&page=2&limit=20
===================================================== */

router.get(
  "/:league",
  getFixtures
);

module.exports = router;