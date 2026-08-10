const express = require("express");

const router = express.Router();

const {
  getLineups,
} = require("../controllers/lineupController");

router.get("/:id", getLineups);

module.exports = router;