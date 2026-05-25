-- Simplified User Registration Table
-- Drop existing table if needed (be careful in production)
-- DROP TABLE IF EXISTS users;

-- Create simplified users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX idx_phone ON users(phone);
CREATE INDEX idx_email ON users(email);

-- Optional: Migration script to copy existing data
-- INSERT INTO users (name, phone, email)
-- SELECT name, phone, email FROM profiles 
-- WHERE phone IS NOT NULL AND email IS NOT NULL;