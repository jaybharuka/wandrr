const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
  const { destination, exclude } = req.query;

  if (!destination || !exclude) {
    return res.status(400).json({ error: "Missing 'destination' or 'exclude' query param" });
  }

  db.query(
    `SELECT id, name, age, origin_city, destination_city FROM profiles WHERE destination_city = $1 AND id != $2`,
    [destination, exclude],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      const formatted = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        age: row.age,
        originCity: row.origin_city,
        destinationCity: row.destination_city,
      }));

      res.json(formatted);
    }
  );
});

module.exports = router;
