-- OTP Schema for YAATRA Application
-- This schema adds OTP (One-Time Password) functionality to the users table
-- OTPs are stored directly in the users table for simplicity

-- Add OTP fields to existing users table
ALTER TABLE users 
ADD COLUMN email_otp VARCHAR(6) DEFAULT NULL,
ADD COLUMN email_otp_expires_at TIMESTAMP NULL DEFAULT NULL,
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN phone_otp VARCHAR(6) DEFAULT NULL,
ADD COLUMN phone_otp_expires_at TIMESTAMP NULL DEFAULT NULL,
ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;

-- Create index for faster OTP lookups
CREATE INDEX idx_email_otp ON users(email_otp);