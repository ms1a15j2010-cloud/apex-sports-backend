const express = require("express");

const router =
  express.Router();

const {
  getPrediction,
} = require(
  "../controllers/predictionController"
);

/* =====================================================
PREDICTION ROUTE

GET:

/api/prediction/:id
===================================================== */

router.get(
  "/:id",
  getPrediction
);

module.exports = router;