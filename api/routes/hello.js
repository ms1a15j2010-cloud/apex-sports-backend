// backend/routes/hello.js
const express = require('express');
const router = express.Router();

// This defines the /api/hello route
router.get('/', (req, res) => {
  res.json({ message: "Hello from the Apex Sports Backend!" });
});

module.exports = router;