import db from '../../../backend/config/db.js';
import otpService from '../../../backend/services/otpService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

  return new Promise((resolve) => {
    db.query(getUserQuery, [userId], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return resolve(res.status(500).json({ error: 'Database error during verification.' }));
      }

      if (result.rows?.length === 0) {
        return resolve(res.status(404).json({ error: 'User not found.' }));
      }

      const user = result.rows[0];
      const otpValid = otpService.isOTPValid(user.stored_otp, otp, user.otp_expires_at);

      if (!otpValid) {
        return resolve(res.status(400).json({ error: 'Invalid or expired OTP.' }));
      }

      const clearQuery = `UPDATE users SET ${otpColumn} = NULL, ${expiryColumn} = NULL WHERE id = $1`;
      db.query(clearQuery, [userId], (err) => {
        if (err) {
          console.error('Database clear error:', err);
        }

        return resolve(res.json({
          success: true,
          message: 'Sign in successful!',
          userId: user.id,
          user: {
            name: user.name,
            phone: user.phone,
            email: user.email
          }
        }));
      });
    });
  });
}
