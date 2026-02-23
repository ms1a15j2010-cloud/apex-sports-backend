const express = require("express");
const router = express.Router();

// GET /api/images
router.get("/", (req, res) => {
  res.json([
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d"
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6"
    }
  ]);
});

module.exports = router;
