const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/users/:id - Get user by ID
router.get('/:id', (req, res) => {
  const userId = req.params.id;

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: 'Valid User ID is required' });
  }

  const query = 'SELECT id, name, email, username FROM users WHERE id = $1';

  db.query(query, [parseInt(userId)], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username
    });
  });
});

// PUT /api/users/:id - Update user name
router.put('/:id', (req, res) => {
  const userId = req.params.id;
  const { name } = req.body;

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: 'Valid User ID is required' });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const query = 'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, username';
  db.query(query, [name.trim(), parseInt(userId)], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, message: 'Profile updated successfully', user: result.rows[0] });
  });
});

module.exports = router;