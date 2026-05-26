const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/hotels?city=Delhi
router.get('/', (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: 'city query parameter is required.' });
  }

  const query = `
    SELECT id, name, city, stars, price_per_night, description, amenities
    FROM hotels
    WHERE city = $1
    ORDER BY stars DESC, price_per_night ASC
  `;

  db.query(query, [city], (err, result) => {
    if (err) {
      console.error('Hotels DB error:', err);
      return res.status(500).json({ error: 'Failed to fetch hotels.' });
    }
    res.json({ hotels: result.rows });
  });
});

// GET /api/hotels/cities  —  list all cities that have hotel data
router.get('/cities', (req, res) => {
  db.query('SELECT DISTINCT city FROM hotels ORDER BY city', (err, result) => {
    if (err) {
      console.error('Hotels cities DB error:', err);
      return res.status(500).json({ error: 'Failed to fetch cities.' });
    }
    res.json({ cities: result.rows.map((r) => r.city) });
  });
});

module.exports = router;
