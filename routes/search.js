const express = require("express");

const router = express.Router();

const {
  searchFootball,
} = require("../controllers/searchController");

router.get("/", searchFootball);

module.exports = router;