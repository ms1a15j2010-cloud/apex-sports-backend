const express = require("express");

const {
  getStandings,
} = require("../controllers/standingsController");

const router = express.Router();

/* =====================================================
STANDINGS

GET:

/api/standings/epl

Examples:

/api/standings/epl?season=2025
/api/standings/epl?season=2026
===================================================== */

router.get(
  "/:id",
  getStandings
);

module.exports = router;