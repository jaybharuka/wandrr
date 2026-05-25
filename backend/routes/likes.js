const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Like a user (swipe right)
router.post('/like', (req, res) => {
  const { likerId, likedId, location } = req.body;

  if (!likerId || !likedId || !location) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (likerId === likedId) {
    return res.status(400).json({ error: 'Cannot like yourself' });
  }

  const checkQuery = 'SELECT id FROM likes WHERE liker_id = ? AND liked_id = ?';

  db.query(checkQuery, [likerId, likedId], (err, existing) => {
    if (err) return res.status(500).json({ error: 'Failed to check existing like' });
    if (existing.length > 0) return res.status(400).json({ error: 'User already liked' });

    const insertQuery = 'INSERT INTO likes (liker_id, liked_id, location) VALUES (?, ?, ?)';
    db.query(insertQuery, [likerId, likedId, location], (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to save like' });

      const mutualQuery = 'SELECT id FROM likes WHERE liker_id = ? AND liked_id = ?';
      db.query(mutualQuery, [likedId, likerId], (err, mutual) => {
        if (err) return res.status(500).json({ error: 'Failed to check for match' });

        const isMatch = mutual.length > 0;
        if (isMatch) {
          db.query(
            'INSERT IGNORE INTO matches (user1_id, user2_id, location) VALUES (?, ?, ?)',
            [likerId, likedId, location], () => {}
          );
        }

        res.json({ success: true, message: 'Like recorded successfully', isMatch, likeId: result.insertId });
      });
    });
  });
});

// Pass/reject a user (swipe left)
router.post('/pass', (req, res) => {
  const { passerId, passedId, location } = req.body;

  if (!passerId || !passedId || !location) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (passerId === passedId) {
    return res.status(400).json({ error: 'Cannot pass yourself' });
  }

  const checkQuery = 'SELECT id FROM passes WHERE passer_id = ? AND passed_id = ?';

  db.query(checkQuery, [passerId, passedId], (err, existing) => {
    if (err) return res.status(500).json({ error: 'Failed to check existing pass' });
    if (existing.length > 0) return res.status(400).json({ error: 'User already passed' });

    const insertQuery = 'INSERT INTO passes (passer_id, passed_id, location) VALUES (?, ?, ?)';
    db.query(insertQuery, [passerId, passedId, location], (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to save pass' });
      res.json({ success: true, message: 'Pass recorded successfully', passId: result.insertId });
    });
  });
});

// Get matches for a user
router.get('/matches/:userId', (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT 
      m.*,
      p1.username as user1_name,
      p1.age as user1_age,
      p1.bio as user1_bio,
      p1.interests as user1_interests,
      p2.username as user2_name,
      p2.age as user2_age,
      p2.bio as user2_bio,
      p2.interests as user2_interests
    FROM matches m
    JOIN profiles p1 ON m.user1_id = p1.user_id
    JOIN profiles p2 ON m.user2_id = p2.user_id
    WHERE m.user1_id = ? OR m.user2_id = ?
    ORDER BY m.matched_at DESC
  `;

  db.query(query, [userId, userId], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch matches' });
    }

    const formattedMatches = rows.map(match => {
      const isUser1 = match.user1_id === parseInt(userId);
      return {
        matchId: match.id,
        matchedAt: match.matched_at,
        location: match.location,
        matchedUser: {
          userId: isUser1 ? match.user2_id : match.user1_id,
          username: isUser1 ? match.user2_name : match.user1_name,
          age: isUser1 ? match.user2_age : match.user1_age,
          bio: isUser1 ? match.user2_bio : match.user1_bio,
          interests: isUser1 ? match.user2_interests : match.user1_interests
        }
      };
    });

    res.json({ matches: formattedMatches });
  });
});

// Get potential matches (users to swipe on)
router.get('/potential/:userId/:location', (req, res) => {
  const { userId, location } = req.params;

  // Get users that haven't been liked or passed by this user
  const query = `
    SELECT DISTINCT p.* 
    FROM profiles p
    WHERE p.user_id != ? 
    AND p.location = ?
    AND p.user_id NOT IN (
      SELECT liked_id FROM likes WHERE liker_id = ?
      UNION
      SELECT passed_id FROM passes WHERE passer_id = ?
    )
    ORDER BY RAND()
    LIMIT 10
  `;

  db.query(query, [userId, location, userId, userId], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch potential matches' });
    }

    res.json({ users: rows });
  });
});

// Get user's likes (who they liked)
router.get('/likes/:userId', (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT 
      l.*,
      p.username,
      p.age,
      p.bio,
      p.interests
    FROM likes l
    JOIN profiles p ON l.liked_id = p.user_id
    WHERE l.liker_id = ?
    ORDER BY l.created_at DESC
  `;

  db.query(query, [userId], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch likes' });
    }

    res.json({ likes: rows });
  });
});

// Get users who liked this user
router.get('/liked-by/:userId', (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT 
      l.*,
      p.username,
      p.age,
      p.bio,
      p.interests
    FROM likes l
    JOIN profiles p ON l.liker_id = p.user_id
    WHERE l.liked_id = ?
    ORDER BY l.created_at DESC
  `;

  db.query(query, [userId], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch who liked you' });
    }

    res.json({ likedBy: rows });
  });
});

// Like/dislike a travel post
router.post('/', (req, res) => {
  const { userId, postId, action } = req.body;

  if (!userId || !postId || !action) {
    return res.status(400).json({ error: 'Missing required fields: userId, postId, action' });
  }

  if (action !== 'like' && action !== 'dislike') {
    return res.status(400).json({ error: 'Action must be either "like" or "dislike"' });
  }

  // First, remove any existing entry for this user-post combination
  const deleteQuery = 'DELETE FROM travel_post_likes WHERE user_id = ? AND post_id = ?';
  
  db.query(deleteQuery, [userId, postId], (err) => {
    if (err) {
      console.error('Error removing existing like:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // If action is 'like', insert new like record
    if (action === 'like') {
      const insertQuery = 'INSERT INTO travel_post_likes (user_id, post_id, liked) VALUES (?, ?, 1)';
      
      db.query(insertQuery, [userId, postId], (err, result) => {
        if (err) {
          console.error('Error inserting like:', err);
          return res.status(500).json({ error: 'Failed to save like' });
        }

        res.json({ 
          success: true, 
          message: 'Post liked successfully',
          action: 'like'
        });
      });
    } else {
      // For dislike, we just removed the entry above, so respond with success
      res.json({ 
        success: true, 
        message: 'Post disliked successfully',
        action: 'dislike'
      });
    }
  });
});

module.exports = router;
