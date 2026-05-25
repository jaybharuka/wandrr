-- Cleanup script to remove unused otp_logs table
-- Run this script on your existing database to remove the orphaned table

-- Drop the otp_logs table if it exists
DROP TABLE IF EXISTS otp_logs;

-- Note: This will remove the table and all its data (if any)
-- Since the table was never used in the application, this is safe to run

-- Your OTP functionality will continue to work normally using the users table
-- which stores: email_otp, phone_otp, email_otp_expires_at, phone_otp_expires_at