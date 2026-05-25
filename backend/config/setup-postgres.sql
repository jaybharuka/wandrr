-- ============================================================
-- WANDRR - PostgreSQL Master Database Setup
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_otp VARCHAR(6),
    email_otp_expires_at TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_otp VARCHAR(6),
    phone_otp_expires_at TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_email_otp ON users(email_otp);

-- Travel Posts table
CREATE TABLE IF NOT EXISTS travel_posts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(100) NOT NULL,
    travelling_from VARCHAR(100) NOT NULL,
    travelling_to VARCHAR(100) NOT NULL,
    travel_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tp_user_id ON travel_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_tp_travelling_to ON travel_posts(travelling_to);
CREATE INDEX IF NOT EXISTS idx_tp_travel_date ON travel_posts(travel_date);

-- Connection Requests table
CREATE TABLE IF NOT EXISTS connection_requests (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cr_sender ON connection_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_cr_receiver ON connection_requests(receiver_id);

-- Travel Groups table
CREATE TABLE IF NOT EXISTS travel_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    destination VARCHAR(100),
    description TEXT,
    join_code VARCHAR(50) UNIQUE NOT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    max_members INT DEFAULT 10,
    created_by INT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tg_join_code ON travel_groups(join_code);
CREATE INDEX IF NOT EXISTS idx_tg_created_by ON travel_groups(created_by);

-- Group Members table
CREATE TABLE IF NOT EXISTS group_members (
    id SERIAL PRIMARY KEY,
    group_id INT NOT NULL REFERENCES travel_groups(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gm_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_gm_user ON group_members(user_id);

-- Hotels table
CREATE TABLE IF NOT EXISTS hotels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    stars INT,
    price_per_night DECIMAL(10, 2),
    description TEXT,
    amenities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hotels_city ON hotels(city);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    destination VARCHAR(100),
    airline VARCHAR(100),
    departure TIMESTAMP,
    arrival TIMESTAMP,
    fare DECIMAL(10, 2),
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);

-- Hotel Bookings table
CREATE TABLE IF NOT EXISTS hotel_bookings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    hotel_id INT REFERENCES hotels(id),
    check_in DATE,
    check_out DATE,
    total_price DECIMAL(10, 2),
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hb_user ON hotel_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_hb_hotel ON hotel_bookings(hotel_id);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(100),
    sender_id INT REFERENCES users(id),
    sender_name VARCHAR(100),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_msg_room ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_msg_sender ON messages(sender_id);

-- Likes/Favorites table
CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    travel_post_id INT NOT NULL REFERENCES travel_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(travel_post_id);
