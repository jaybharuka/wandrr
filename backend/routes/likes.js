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

  db.query('SELECT id FROM likes WHERE liker_id = $1 AND liked_id = $2', [likerId, likedId], (err, checkResult) => {
    if (err) return res.status(500).json({ error: 'Failed to check existing like' });
    if (checkResult.rows.length > 0) return res.status(400).json({ error: 'User already liked' });

    db.query('INSERT INTO likes (liker_id, liked_id, location) VALUES ($1, $2, $3) RETURNING id', [likerId, likedId, location], (err, insertResult) => {
      if (err) return res.status(500).json({ error: 'Failed to save like' });

      db.query('SELECT id FROM likes WHERE liker_id = $1 AND liked_id = $2', [likedId, likerId], (err, mutualResult) => {
        if (err) return res.status(500).json({ error: 'Failed to check for match' });

        const isMatch = mutualResult.rows.length > 0;
        if (isMatch) {
          db.query(
            'INSERT INTO matches (user1_id, user2_id, location) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
            [likerId, likedId, location], () => {}
          );
        }

        res.json({ success: true, message: 'Like recorded successfully', isMatch, likeId: insertResult.rows[0].id });
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

  db.query('SELECT id FROM passes WHERE passer_id = $1 AND passed_id = $2', [passerId, passedId], (err, checkResult) => {
    if (err) return res.status(500).json({ error: 'Failed to check existing pass' });
    if (checkResult.rows.length > 0) return res.status(400).json({ error: 'User already passed' });

    db.query('INSERT INTO passes (passer_id, passed_id, location) VALUES ($1, $2, $3) RETURNING id', [passerId, passedId, location], (err, insertResult) => {
      if (err) return res.status(500).json({ error: 'Failed to save pass' });
      res.json({ success: true, message: 'Pass recorded successfully', passId: insertResult.rows[0].id });
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
      p2.username as user2_name,
      p2.age as user2_age,
      p2.bio as user2_bio
    FROM matches m
    JOIN profiles p1 ON m.user1_id = p1.user_id
    JOIN profiles p2 ON m.user2_id = p2.user_id
    WHERE m.user1_id = $1 OR m.user2_id = $1
    ORDER BY m.matched_at DESC
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch matches' });
    }

    const formattedMatches = result.rows.map(match => {
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
        }
      };
    });

    res.json({ matches: formattedMatches });
  });
});

// Get potential matches (users to swipe on)
router.get('/potential/:userId/:location', (req, res) => {
  const { userId, location } = req.params;

  const query = `
    SELECT DISTINCT p.*
    FROM profiles p
    WHERE p.user_id != $1
    AND p.location = $2
    AND p.user_id NOT IN (
      SELECT liked_id FROM likes WHERE liker_id = $1
      UNION
      SELECT passed_id FROM passes WHERE passer_id = $1
    )
    ORDER BY RANDOM()
    LIMIT 10
  `;

  db.query(query, [userId, location], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch potential matches' });
    }

    res.json({ users: result.rows });
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

  db.query('DELETE FROM travel_post_likes WHERE user_id = $1 AND post_id = $2', [userId, postId], (err) => {
    if (err) {
      console.error('Error removing existing like:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (action === 'like') {
      db.query('INSERT INTO travel_post_likes (user_id, post_id, liked) VALUES ($1, $2, true)', [userId, postId], (err) => {
        if (err) {
          console.error('Error inserting like:', err);
          return res.status(500).json({ error: 'Failed to save like' });
        }
        res.json({ success: true, message: 'Post liked successfully', action: 'like' });
      });
    } else {
      res.json({ success: true, message: 'Post disliked successfully', action: 'dislike' });
    }
  });
});

module.exports = router;
