const express = require("express");

const {
  getTopScorersMini,
} = require("../controllers/topScorersMiniController");

const router =
  express.Router();

/* =====================================================
TOP SCORERS MINI

Examples:

/api/top-scorers-mini

/api/top-scorers-mini?league=39

/api/top-scorers-mini?league=epl

/api/top-scorers-mini?league=PL

/api/top-scorers-mini?league=epl&season=2025
===================================================== */

router.get(
  "/",
  getTopScorersMini
);

module.exports = router;