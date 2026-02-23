const express = require("express");
const router = express.Router();

// GET /api/hello
router.get("/", (req, res) => {
  res.json({ message: "Hello from the Apex Sports Backend!" });
});

module.exports = router;
