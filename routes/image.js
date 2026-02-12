const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json([
    {
      id: 1,
      title: "Live Football",
      image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2",
    },
    {
      id: 2,
      title: "Cricket Action",
      image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d",
    },
    {
      id: 3,
      title: "Tennis Match",
      image: "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf",
    },
  ]);
});

module.exports = router;
