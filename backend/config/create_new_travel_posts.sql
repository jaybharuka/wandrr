-- Create new travel_posts table for solo traveller posts
-- Based on Create Post form inputs: userId, userName, travellingFrom, travellingTo, travelDate

CREATE TABLE travel_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    travelling_from VARCHAR(100) NOT NULL,
    travelling_to VARCHAR(100) NOT NULL,
    travel_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_travelling_to ON travel_posts(travelling_to);
CREATE INDEX idx_travelling_from ON travel_posts(travelling_from);
CREATE INDEX idx_user_id ON travel_posts(user_id);
CREATE INDEX idx_travel_date ON travel_posts(travel_date);
CREATE INDEX idx_created_at ON travel_posts(created_at);