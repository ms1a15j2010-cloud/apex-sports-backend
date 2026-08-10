const express = require("express");

const router = express.Router();

const {
  getTopScorersMini,
} = require("../controllers/topScorersMiniController");

router.get("/", getTopScorersMini);

module.exports = router;