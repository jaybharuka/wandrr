const express = require('express');
const router = express.Router();
const db = require('../config/db');
const otpService = require('../services/otpService');

// POST /api/auth/signup/initiate - Start signup process and send OTPs
router.post('/signup/initiate', async (req, res) => {
  const { name, phone, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  if (phone) {
    const phoneRegex = /^\+91[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Phone number must be in format +91XXXXXXXXXX (10 digits starting with 6-9).' });
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const checkQuery = phone
    ? 'SELECT id, is_verified FROM users WHERE phone = $1 OR email = $2'
    : 'SELECT id, is_verified FROM users WHERE email = $1';
  const checkParams = phone ? [phone, email] : [email];

  db.query(checkQuery, checkParams, async (err, result) => {
    if (err) {
      console.error('Database check error:', err);
      return res.status(500).json({ error: 'Database error during validation.' });
    }

    if (result.rows?.length > 0) {
      const existing = result.rows[0];
      if (existing.is_verified) {
        return res.status(400).json({ error: 'Phone number or email already registered.' });
      }

      const emailOTP = otpService.generateOTP();
      const otpExpiry = otpService.getOTPExpiry();
      const updateQuery = 'UPDATE users SET email_otp = $1, email_otp_expires_at = $2 WHERE id = $3';

      db.query(updateQuery, [emailOTP, otpExpiry, existing.id], async (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to resend OTP.' });
        }
        const emailResult = await otpService.sendEmailOTP(email, emailOTP, 'signup');
        return res.json({
          success: true,
          message: 'OTP resent to your email!',
          userId: existing.id,
          emailSent: emailResult.success
        });
      });
      return;
    }

    const emailOTP = otpService.generateOTP();
    const otpExpiry = otpService.getOTPExpiry();

    const insertQuery = `
      INSERT INTO users (name, phone, email, email_otp, email_otp_expires_at, email_verified, is_verified)
      VALUES ($1, $2, $3, $4, $5, false, false)
      RETURNING id
    `;

    db.query(insertQuery, [name, phone || null, email, emailOTP, otpExpiry], async (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to initiate signup.' });
      }

      const emailResult = await otpService.sendEmailOTP(email, emailOTP, 'signup');

      res.status(201).json({
        success: true,
        message: 'OTP sent to your email!',
        userId: result.rows[0]?.id,
        emailSent: emailResult.success
      });
    });
  });
});

// POST /api/auth/signup/verify - Verify OTPs and complete signup
router.post('/signup/verify', (req, res) => {
  const { userId, emailOTP } = req.body;

  if (!userId || !emailOTP) {
    return res.status(400).json({ error: 'User ID and email OTP are required.' });
  }

  const getUserQuery = `
    SELECT id, name, phone, email, email_otp, email_otp_expires_at, email_verified
    FROM users WHERE id = $1
  `;

  db.query(getUserQuery, [userId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error during verification.' });
    }

    if (result.rows?.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = result.rows[0];
    const emailValid = otpService.isOTPValid(user.email_otp, emailOTP, user.email_otp_expires_at);

    if (!emailValid) {
      return res.status(400).json({
        error: 'Invalid or expired email OTP.'
      });
    }

    const updateQuery = `
      UPDATE users
      SET email_verified = true, is_verified = true,
          email_otp = NULL, email_otp_expires_at = NULL
      WHERE id = $1
    `;

    db.query(updateQuery, [userId], (err) => {
      if (err) {
        console.error('Database update error:', err);
        return res.status(500).json({ error: 'Failed to complete verification.' });
      }

      res.json({
        success: true,
        message: 'Signup completed successfully!',
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email
        }
      });
    });
  });
});

// POST /api/auth/signin/initiate - Send OTP for signin
router.post('/signin/initiate', async (req, res) => {
  const { phone, email } = req.body;

  if (!phone && !email) {
    return res.status(400).json({ error: 'Phone number or email is required.' });
  }

  const loginField = phone || email;
  const loginColumn = phone ? 'phone' : 'email';
  const otpType = phone ? 'phone' : 'email';

  if (phone) {
    const phoneRegex = /^\+91[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format. Use +91XXXXXXXXXX.' });
    }
  }

  const sql = `SELECT id, name, phone, email FROM users WHERE ${loginColumn} = $1`;
  db.query(sql, [loginField], async (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error during signin.' });
    }

    if (result.rows?.length === 0) {
      return res.status(401).json({ error: 'User not found. Please register first.' });
    }

    const user = result.rows[0];
    const otp = otpService.generateOTP();
    const otpExpiry = otpService.getOTPExpiry();

    const otpColumn = otpType === 'phone' ? 'phone_otp' : 'email_otp';
    const expiryColumn = otpType === 'phone' ? 'phone_otp_expires_at' : 'email_otp_expires_at';

    const updateQuery = `UPDATE users SET ${otpColumn} = $1, ${expiryColumn} = $2 WHERE id = $3`;
    db.query(updateQuery, [otp, otpExpiry, user.id], async (err) => {
      if (err) {
        console.error('Database update error:', err);
        return res.status(500).json({ error: 'Failed to generate OTP.' });
      }

      let otpResult;
      if (otpType === 'phone') {
        otpResult = await otpService.sendPhoneOTP(user.phone, otp, 'signin');
      } else {
        otpResult = await otpService.sendEmailOTP(user.email, otp, 'signin');
      }

      res.json({
        success: true,
        message: `OTP sent to your ${otpType}!`,
        userId: user.id,
        otpType,
        otpSent: otpResult.success,
        note: otpResult.note || undefined
      });
    });
  });
});

// POST /api/auth/signin/verify - Verify OTP and complete signin
router.post('/signin/verify', (req, res) => {
  const { userId, otp, otpType } = req.body;

  if (!userId || !otp || !otpType) {
    return res.status(400).json({ error: 'User ID, OTP, and OTP type are required.' });
  }

  if (!['phone', 'email'].includes(otpType)) {
    return res.status(400).json({ error: 'OTP type must be either "phone" or "email".' });
  }

  const otpColumn = otpType === 'phone' ? 'phone_otp' : 'email_otp';
  const expiryColumn = otpType === 'phone' ? 'phone_otp_expires_at' : 'email_otp_expires_at';

  const getUserQuery = `
    SELECT id, name, phone, email, ${otpColumn} as stored_otp, ${expiryColumn} as otp_expires_at
    FROM users WHERE id = $1
  `;

  db.query(getUserQuery, [userId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error during verification.' });
    }

    if (result.rows?.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = result.rows[0];
    const otpValid = otpService.isOTPValid(user.stored_otp, otp, user.otp_expires_at);

    if (!otpValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    const clearQuery = `UPDATE users SET ${otpColumn} = NULL, ${expiryColumn} = NULL WHERE id = $1`;
    db.query(clearQuery, [userId], (err) => {
      if (err) {
        console.error('Database clear error:', err);
      }

      res.json({
        success: true,
        message: 'Sign in successful!',
        userId: user.id,
        user: {
          name: user.name,
          phone: user.phone,
          email: user.email
        }
      });
    });
  });
});

module.exports = router;
