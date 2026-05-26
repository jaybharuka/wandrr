import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';

const router = express.Router();

// POST /api/auth/signup - Create account with username/email and 4-digit PIN
router.post('/signup', async (req, res) => {
  const { name, username, email, phone, pin } = req.body;

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

  // Validate phone if provided
  if (phone) {
    const phoneRegex = /^\+91[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Phone number must be in format +91XXXXXXXXXX.' });
    }
  }

  try {
    // Check if username or email already exists
    const checkQuery = 'SELECT id FROM users WHERE username = $1 OR email = $2';
    const checkResult = await new Promise((resolve, reject) => {
      db.query(checkQuery, [username.toLowerCase(), email], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (checkResult.rows.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists.' });
    }

    // Hash PIN with bcrypt (salt rounds = 10)
    const hashedPin = await bcrypt.hash(pin, 10);

    // Insert new user
    const insertQuery = `
      INSERT INTO users (name, username, email, phone, pin)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, username, email
    `;
    const insertResult = await new Promise((resolve, reject) => {
      db.query(insertQuery, [name, username.toLowerCase(), email, phone || null, hashedPin], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const user = insertResult.rows[0];
    return res.status(201).json({
      success: true,
      message: 'Account created',
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email
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
    const getUserQuery = 'SELECT id, name, username, email, phone, pin FROM users WHERE username = $1 OR email = $1';
    const getUserResult = await new Promise((resolve, reject) => {
      db.query(getUserQuery, [identifier.toLowerCase()], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (getUserResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = getUserResult.rows[0];

    // Compare PIN with hashed PIN
    const pinMatch = await bcrypt.compare(pin, user.pin);
    if (!pinMatch) {
      return res.status(401).json({ error: 'Invalid PIN.' });
    }

    // Return user info (without PIN hash)
    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({ error: 'Failed to sign in.' });
  }
});

export default router;
