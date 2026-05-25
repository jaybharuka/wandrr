import db from '../../../backend/config/db.js';
import otpService from '../../../backend/services/otpService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

  return new Promise((resolve) => {
    db.query(checkQuery, checkParams, async (err, result) => {
      if (err) {
        console.error('Database check error:', err);
        return resolve(res.status(500).json({ error: 'Database error during validation.' }));
      }

      if (result.rows?.length > 0) {
        const existing = result.rows[0];
        if (existing.is_verified) {
          return resolve(res.status(400).json({ error: 'Phone number or email already registered.' }));
        }

        const emailOTP = otpService.generateOTP();
        const otpExpiry = otpService.getOTPExpiry();
        const updateQuery = 'UPDATE users SET email_otp = $1, email_otp_expires_at = $2 WHERE id = $3';

        db.query(updateQuery, [emailOTP, otpExpiry, existing.id], (err) => {
          if (err) {
            return resolve(res.status(500).json({ error: 'Failed to resend OTP.' }));
          }
          otpService.sendEmailOTP(email, emailOTP, 'signup').catch(e => {
            console.error('Background email send error:', e.message);
          });
          return resolve(res.json({
            success: true,
            message: 'OTP resent to your email!',
            userId: existing.id
          }));
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

      db.query(insertQuery, [name, phone || null, email, emailOTP, otpExpiry], (err, result) => {
        if (err) {
          return resolve(res.status(500).json({ error: 'Failed to initiate signup.' }));
        }

        const userId = result.rows[0]?.id;

        otpService.sendEmailOTP(email, emailOTP, 'signup').catch(e => {
          console.error('Background email send error:', e.message);
        });

        return resolve(res.status(201).json({
          success: true,
          message: 'OTP sent to your email!',
          userId
        }));
      });
    });
  });
}
