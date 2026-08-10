const express = require("express");

const router = express.Router();

const {
  getHeadToHead,
} = require("../controllers/headToHeadController");

router.get("/:home/:away", getHeadToHead);

module.exports = router;