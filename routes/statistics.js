const express = require("express");

const {
  getStatistics,
} = require(
  "../controllers/statisticsController"
);

const router =
  express.Router();

/* =====================================================
MATCH STATISTICS ROUTE

GET:

/api/statistics/:id

The Match Center may also access the same handler
through its existing route structure depending on
index.js registration.
===================================================== */

router.get(
  "/:id",
  getStatistics
);

module.exports = router;