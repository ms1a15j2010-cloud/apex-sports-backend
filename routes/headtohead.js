const express = require("express");

const router =
  express.Router();

const {
  getHeadToHead,
} = require(
  "../controllers/headToHeadController"
);

/* =====================================================
HEAD-TO-HEAD

GET:

/api/headtohead/:home/:away
===================================================== */

router.get(
  "/:home/:away",
  getHeadToHead
);

module.exports = router;