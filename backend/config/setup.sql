-- ============================================================
-- YAATRA - Master Database Setup
-- Run this file once to create all required tables.
-- Database: solo_travel_app
-- ============================================================

CREATE DATABASE IF NOT EXISTS solo_travel_app;
USE solo_travel_app;

-- ------------------------------------------------------------
-- 1. Users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_otp VARCHAR(6) DEFAULT NULL,
    email_otp_expires_at TIMESTAMP NULL DEFAULT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_otp VARCHAR(6) DEFAULT NULL,
    phone_otp_expires_at TIMESTAMP NULL DEFAULT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_email_otp (email_otp)
);

-- ------------------------------------------------------------
-- 2. Travel Posts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS travel_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    travelling_from VARCHAR(100) NOT NULL,
    travelling_to VARCHAR(100) NOT NULL,
    travel_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_tp_user_id (user_id),
    INDEX idx_tp_travelling_to (travelling_to),
    INDEX idx_tp_travel_date (travel_date)
);

-- ------------------------------------------------------------
-- 3. Connection Requests
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS connection_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_user_id INT NOT NULL,
    to_user_id INT NOT NULL,
    post_id INT NOT NULL,
    message TEXT,
    status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES travel_posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_request (from_user_id, to_user_id, post_id),
    INDEX idx_cr_from_user (from_user_id),
    INDEX idx_cr_to_user (to_user_id),
    INDEX idx_cr_status (status)
);

-- ------------------------------------------------------------
-- 4. Flight Bookings
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    destination VARCHAR(100) NOT NULL,
    flight_details TEXT NOT NULL,
    booking_date TIMESTAMP NOT NULL,
    status ENUM('active', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_b_user_id (user_id),
    INDEX idx_b_status (status)
);

-- ------------------------------------------------------------
-- 5. Hotel Bookings
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hotel_bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    destination VARCHAR(100) NOT NULL,
    hotel_name VARCHAR(255) NOT NULL,
    booking_date TIMESTAMP NOT NULL,
    status ENUM('active', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_hb_user_id (user_id),
    INDEX idx_hb_status (status)
);

-- ------------------------------------------------------------
-- 6. Travel Groups
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS travel_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INT NOT NULL,
    join_code VARCHAR(8) NOT NULL UNIQUE,
    is_private TINYINT(1) DEFAULT 0,
    max_members INT DEFAULT 20,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_tg_destination (destination),
    INDEX idx_tg_join_code (join_code)
);

-- ------------------------------------------------------------
-- 7. Group Members
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS group_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES travel_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_membership (group_id, user_id),
    INDEX idx_gm_group_id (group_id),
    INDEX idx_gm_user_id (user_id)
);
