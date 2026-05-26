-- Migration: Replace OTP auth with PIN auth
-- This handles existing data properly

-- Step 1: Drop OTP columns if they exist
ALTER TABLE users
  DROP COLUMN IF EXISTS email_otp CASCADE,
  DROP COLUMN IF EXISTS email_otp_expires_at CASCADE,
  DROP COLUMN IF EXISTS phone_otp CASCADE,
  DROP COLUMN IF EXISTS phone_otp_expires_at CASCADE,
  DROP COLUMN IF EXISTS email_verified CASCADE,
  DROP COLUMN IF EXISTS is_verified CASCADE;

-- Step 2: Add username and pin columns if they don't exist
-- First check if we need to add them
DO $$
BEGIN
  -- Add username column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='username') THEN
    ALTER TABLE users ADD COLUMN username VARCHAR(50);
  END IF;

  -- Add pin column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='pin') THEN
    ALTER TABLE users ADD COLUMN pin VARCHAR(60);
  END IF;
END $$;

-- Step 3: Generate unique usernames from emails if username is still NULL
UPDATE users
SET username = LOWER(SPLIT_PART(email, '@', 1) || '_' || id)
WHERE username IS NULL OR username = '';

-- Step 4: Add unique constraint
ALTER TABLE users
  ADD CONSTRAINT users_username_unique UNIQUE (username);

-- Step 5: Make sure pin column can accept data
ALTER TABLE users
  ALTER COLUMN pin DROP NOT NULL;

-- Step 6: Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_username ON users(username);
