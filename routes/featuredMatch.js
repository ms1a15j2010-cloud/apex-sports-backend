const express = require("express");

const router = express.Router();

const {
  getFeaturedMatch,
} = require("../controllers/featuredMatchController");

router.get("/", getFeaturedMatch);

module.exports = router;