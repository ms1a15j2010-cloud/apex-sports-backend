const express = require('express');
const router = express.Router();

// Example route: GET /api/hello
router.get('/hello', (req, res) => {
  res.json({ message: 'Hello from API!' });
});

// Example route: POST /api/data
router.post('/data', (req, res) => {
  const { name, age } = req.body;
  res.json({ message: `Received data: ${name}, ${age}` });
});

module.exports = router;
