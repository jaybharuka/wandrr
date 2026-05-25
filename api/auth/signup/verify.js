import db from '../../../backend/config/db.js';
import otpService from '../../../backend/services/otpService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, emailOTP } = req.body;

  if (!userId || !emailOTP) {
    return res.status(400).json({ error: 'User ID and email OTP are required.' });
  }

  const getUserQuery = `
    SELECT id, name, phone, email, email_otp, email_otp_expires_at, email_verified
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
      const emailValid = otpService.isOTPValid(user.email_otp, emailOTP, user.email_otp_expires_at);

      if (!emailValid) {
        return resolve(res.status(400).json({
          error: 'Invalid or expired email OTP.'
        }));
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
          return resolve(res.status(500).json({ error: 'Failed to complete verification.' }));
        }

        return resolve(res.json({
          success: true,
          message: 'Signup completed successfully!',
          user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email
          }
        }));
      });
    });
  });
}
