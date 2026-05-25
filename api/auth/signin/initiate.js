import db from '../../../backend/config/db.js';
import otpService from '../../../backend/services/otpService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

  return new Promise((resolve) => {
    db.query(sql, [loginField], async (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return resolve(res.status(500).json({ error: 'Database error during signin.' }));
      }

      if (result.rows?.length === 0) {
        return resolve(res.status(401).json({ error: 'User not found. Please register first.' }));
      }

      const user = result.rows[0];
      const otp = otpService.generateOTP();
      const otpExpiry = otpService.getOTPExpiry();

      const otpColumn = otpType === 'phone' ? 'phone_otp' : 'email_otp';
      const expiryColumn = otpType === 'phone' ? 'phone_otp_expires_at' : 'email_otp_expires_at';

      const updateQuery = `UPDATE users SET ${otpColumn} = $1, ${expiryColumn} = $2 WHERE id = $3`;
      db.query(updateQuery, [otp, otpExpiry, user.id], (err) => {
        if (err) {
          console.error('Database update error:', err);
          return resolve(res.status(500).json({ error: 'Failed to generate OTP.' }));
        }

        if (otpType === 'phone') {
          otpService.sendPhoneOTP(user.phone, otp, 'signin').catch(e => {
            console.error('Background phone OTP error:', e.message);
          });
        } else {
          otpService.sendEmailOTP(user.email, otp, 'signin').catch(e => {
            console.error('Background email OTP error:', e.message);
          });
        }

        return resolve(res.json({
          success: true,
          message: `OTP sent to your ${otpType}!`,
          userId: user.id,
          otpType
        }));
      });
    });
  });
}
