const express = require("express");

const {
  getLiveMatches,
} = require(
  "../controllers/liveController"
);

const router =
  express.Router();

/* =====================================================
LIVE ROUTE

GET /api/live
===================================================== */

router.get(
  "/",
  getLiveMatches
);

module.exports = router;