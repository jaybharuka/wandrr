const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/users/:id - Get user by ID
router.get('/:id', (req, res) => {
  const userId = req.params.id;
  
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: 'Valid User ID is required' });
  }

  const query = 'SELECT id, name, phone, email, email_verified, is_verified FROM users WHERE id = ?';
  
  db.query(query, [parseInt(userId)], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = results[0];
    res.json({
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      isVerified: user.is_verified
    });
  });
});

// PUT /api/users/:id - Update user name and phone
router.put('/:id', (req, res) => {
  const userId = req.params.id;
  const { name, phone } = req.body;

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: 'Valid User ID is required' });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const query = 'UPDATE users SET name = ?, phone = ? WHERE id = ?';
  db.query(query, [name.trim(), phone || null, parseInt(userId)], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, message: 'Profile updated successfully' });
  });
});

module.exports = router;