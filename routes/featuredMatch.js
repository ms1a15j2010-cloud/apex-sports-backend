const express = require("express");

const router =
  express.Router();

const {
  getFeaturedMatch,
} = require(
  "../controllers/featuredMatchController"
);

/* =====================================================
FEATURED MATCH

GET:

/api/featured-match
===================================================== */

router.get(
  "/",
  getFeaturedMatch
);

module.exports = router;