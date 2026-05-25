const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/travel-posts - Create a new travel post
router.post('/', (req, res) => {
  const { userId, userName, travellingFrom, travellingTo, travelDate } = req.body;
  
  if (!userId || !userName || !travellingFrom || !travellingTo || !travelDate) {
    return res.status(400).json({ 
      error: 'All fields are required: userId, userName, travellingFrom, travellingTo, and travelDate' 
    });
  }

  const query = `
    INSERT INTO travel_posts (user_id, user_name, travelling_from, travelling_to, travel_date)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [userId, userName, travellingFrom, travellingTo, travelDate], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to create travel post' });
    }
    
    res.status(201).json({ 
      success: true,
      message: 'Travel post created successfully',
      postId: result.insertId,
      data: {
        id: result.insertId,
        userId,
        userName,
        travellingFrom,
        travellingTo,
        travelDate
      }
    });
  });
});

// GET /api/travel-posts - Get all travel posts with user info
router.get('/', (req, res) => {
  const { destination, excludeUserId, userId } = req.query;
  
  let query = `
    SELECT 
      tp.id,
      tp.user_id,
      tp.user_name,
      tp.travelling_from,
      tp.travelling_to,
      tp.travel_date,
      tp.created_at,
      tp.updated_at,
      u.phone as user_phone,
      u.email as user_email
    FROM travel_posts tp
    JOIN users u ON tp.user_id = u.id
  `;
  
  const params = [];
  const conditions = [];
  
  if (destination) {
    conditions.push('tp.travelling_to = ?');
    params.push(destination);
  }
  
  if (excludeUserId) {
    conditions.push('tp.user_id != ?');
    params.push(excludeUserId);
  }
  
  // Filter by specific userId (for "My Posts" functionality)
  if (userId) {
    conditions.push('tp.user_id = ?');
    params.push(userId);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY tp.created_at DESC';

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch travel posts' });
    }
    
    // For userId queries, return the results directly as an array
    if (userId) {
      return res.json(results);
    }
    
    // Parse interests JSON for each post (for non-userId queries)
    const postsWithParsedInterests = results.map(post => ({
      ...post,
      interests: post.interests ? JSON.parse(post.interests) : []
    }));
    
    res.json({ posts: postsWithParsedInterests });
  });
});

// GET /api/travel-posts/user/:userId - Get posts by specific user
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  
  const query = `
    SELECT 
      tp.*,
      u.name as user_name
    FROM travel_posts tp
    JOIN users u ON tp.user_id = u.id
    WHERE tp.user_id = ?
    ORDER BY tp.created_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch user posts' });
    }
    
    res.json({ posts: results });
  });
});

// DELETE /api/travel-posts/:id - Delete a travel post (owner only)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required.' });
  }

  const query = 'DELETE FROM travel_posts WHERE id = ? AND user_id = ?';
  db.query(query, [id, userId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to delete travel post.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Post not found or you do not have permission to delete it.' });
    }
    res.json({ success: true, message: 'Travel post deleted successfully.' });
  });
});

module.exports = router;