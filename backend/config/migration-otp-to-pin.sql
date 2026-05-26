-- Migration: Replace OTP auth with PIN auth
-- Run this SQL against your PostgreSQL database

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS pin VARCHAR(60),
  DROP COLUMN IF EXISTS email_otp,
  DROP COLUMN IF EXISTS email_otp_expires_at,
  DROP COLUMN IF EXISTS phone_otp,
  DROP COLUMN IF EXISTS phone_otp_expires_at,
  DROP COLUMN IF EXISTS email_verified,
  DROP COLUMN IF EXISTS is_verified;

-- Make sure username is unique and no longer has default
ALTER TABLE users
  ALTER COLUMN username DROP DEFAULT;

-- Optional: Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_username ON users(username);
