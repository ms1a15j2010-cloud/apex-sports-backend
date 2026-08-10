const express = require("express");

const router = express.Router();

const {
  getStandingsMini,
} = require("../controllers/standingsMiniController");

router.get("/", getStandingsMini);

module.exports = router;