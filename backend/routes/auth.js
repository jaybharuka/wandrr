const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

const router = express.Router();

// POST /api/auth/signup - Create account with username/email and 4-digit PIN
router.post('/signup', async (req, res) => {
  const { name, username, email, pin } = req.body;

  // Validate required fields
  if (!name || !username || !email || !pin) {
    return res.status(400).json({ error: 'Name, username, email, and PIN are required.' });
  }

  // Validate PIN is exactly 4 digits
  if (!/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: 'PIN must be exactly 4 digits.' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    // Check if username or email already exists
    const checkQuery = 'SELECT id FROM users WHERE username = $1 OR email = $2';
    db.query(checkQuery, [username.toLowerCase(), email], async (err, checkResult) => {
      if (err) {
        console.error('Database check error:', err);
        return res.status(500).json({ error: 'Database error.' });
      }

      if (checkResult.rows.length > 0) {
        return res.status(409).json({ error: 'Username or email already exists.' });
      }

      try {
        // Hash PIN with bcrypt (salt rounds = 10)
        const hashedPin = await bcrypt.hash(pin, 10);

        // Insert new user
        const insertQuery = `
          INSERT INTO users (name, username, email, pin)
          VALUES ($1, $2, $3, $4)
          RETURNING id, name, username, email
        `;
        db.query(insertQuery, [name, username.toLowerCase(), email, hashedPin], (err, insertResult) => {
          if (err) {
            console.error('Database insert error:', err);
            // Handle specific constraint violations
            if (err.code === '23505') {
              if (err.constraint === 'users_email_key') {
                return res.status(409).json({ error: 'Email already exists.' });
              } else if (err.constraint === 'users_phone_key') {
                return res.status(409).json({ error: 'Phone number already exists.' });
              }
            }
            return res.status(500).json({ error: 'Failed to create account.' });
          }

          const user = insertResult.rows[0];
          return res.status(201).json({
            success: true,
            message: 'Account created',
            token: signToken(user),
            user: {
              id: user.id,
              name: user.name,
              username: user.username,
              email: user.email
            }
          });
        });
      } catch (error) {
        console.error('Hash error:', error);
        return res.status(500).json({ error: 'Failed to create account.' });
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Failed to create account.' });
  }
});

// POST /api/auth/signin - Sign in with username/email and PIN
router.post('/signin', async (req, res) => {
  const { identifier, pin } = req.body;

  if (!identifier || !pin) {
    return res.status(400).json({ error: 'Username/email and PIN are required.' });
  }

  try {
    // Find user by username or email
    const getUserQuery = 'SELECT id, name, username, email, pin FROM users WHERE username = $1 OR email = $1';
    db.query(getUserQuery, [identifier.toLowerCase()], async (err, getUserResult) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error.' });
      }

      if (getUserResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const user = getUserResult.rows[0];

      try {
        // Compare PIN with hashed PIN
        const pinMatch = await bcrypt.compare(pin, user.pin);
        if (!pinMatch) {
          return res.status(401).json({ error: 'Invalid PIN.' });
        }

        // Return user info (without PIN hash)
        return res.json({
          success: true,
          token: signToken(user),
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email
          }
        });
      } catch (error) {
        console.error('Pin comparison error:', error);
        return res.status(500).json({ error: 'Failed to sign in.' });
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({ error: 'Failed to sign in.' });
  }
});

module.exports = router;
