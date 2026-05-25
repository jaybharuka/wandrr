-- Run this in your MySQL database (solo_travel_app)

CREATE TABLE IF NOT EXISTS connection_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_user_id INT NOT NULL,
    to_user_id INT NOT NULL,
    post_id INT NOT NULL,
    message TEXT,
    status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES travel_posts(id) ON DELETE CASCADE,
    
    -- Indexes for better performance
    INDEX idx_from_user (from_user_id),
    INDEX idx_to_user (to_user_id),
    INDEX idx_post (post_id),
    INDEX idx_status (status),
    
    -- Prevent duplicate requests
    UNIQUE KEY unique_request (from_user_id, to_user_id, post_id)
);

-- Check if table was created successfully
SHOW TABLES LIKE 'connection_requests';
DESCRIBE connection_requests;