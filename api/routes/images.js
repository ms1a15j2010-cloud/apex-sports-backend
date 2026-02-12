// backend/routes/images.js
const express = require('express');
const router = express.Router();

// This defines the /api/images route
router.get('/', (req, res) => {
  // FAKE DATA for now. Later you'll get this from MongoDB.
  const images = [
    { id: 1, title: 'Cool Car', url: 'https://via.placeholder.com/300x200.png?text=Cool+Car' },
    { id: 2, title: 'Nice Sunset', url: 'https://via.placeholder.com/300x200.png?text=Sunset' },
    { id: 3, title: 'Forest Path', url: 'https://via.placeholder.com/300x200.png?text=Forest' },
  ];
  res.json(images);
});

module.exports = router;