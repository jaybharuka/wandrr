const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/connection-requests - Send a connection request
router.post('/', (req, res) => {
  const { fromUserId, toUserId, postId, message } = req.body;

  if (!fromUserId || !toUserId || !postId) {
    return res.status(400).json({
      error: 'fromUserId, toUserId, and postId are required'
    });
  }

  // Check if request already exists
  const checkQuery = `
    SELECT id FROM connection_requests
    WHERE from_user_id = $1 AND to_user_id = $2 AND post_id = $3
  `;

  db.query(checkQuery, [fromUserId, toUserId, postId], (err, checkResult) => {
    if (err) {
      console.error('Database error checking existing request:', err);
      return res.status(500).json({ error: 'Failed to check existing request' });
    }

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'Connection request already sent' });
    }

    // Insert new connection request
    const insertQuery = `
      INSERT INTO connection_requests (from_user_id, to_user_id, post_id, message, status)
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING id
    `;

    db.query(insertQuery, [fromUserId, toUserId, postId, message], (err, insertResult) => {
      if (err) {
        console.error('Database error creating connection request:', err);
        return res.status(500).json({ error: 'Failed to send connection request' });
      }

      res.status(201).json({
        success: true,
        message: 'Connection request sent successfully',
        requestId: insertResult.rows[0].id
      });
    });
  });
});

// GET /api/connection-requests/sent/:userId - Get sent requests
router.get('/sent/:userId', (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT
      cr.id,
      cr.post_id,
      cr.message,
      cr.status,
      cr.created_at,
      u.name as to_user_name,
      u.email as to_user_email,
      tp.travelling_from,
      tp.travelling_to,
      tp.travel_date
    FROM connection_requests cr
    JOIN users u ON cr.to_user_id = u.id
    JOIN travel_posts tp ON cr.post_id = tp.id
    WHERE cr.from_user_id = $1
    ORDER BY cr.created_at DESC
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error('Database error fetching sent requests:', err);
      return res.status(500).json({ error: 'Failed to fetch sent requests' });
    }

    res.json(result.rows);
  });
});

// GET /api/connection-requests/received/:userId - Get received requests
router.get('/received/:userId', (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT
      cr.id,
      cr.post_id,
      cr.message,
      cr.status,
      cr.created_at,
      u.name as from_user_name,
      u.email as from_user_email,
      tp.travelling_from,
      tp.travelling_to,
      tp.travel_date
    FROM connection_requests cr
    JOIN users u ON cr.from_user_id = u.id
    JOIN travel_posts tp ON cr.post_id = tp.id
    WHERE cr.to_user_id = $1
    ORDER BY cr.created_at DESC
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error('Database error fetching received requests:', err);
      return res.status(500).json({ error: 'Failed to fetch received requests' });
    }

    res.json(result.rows);
  });
});

// PUT /api/connection-requests/:requestId/accept - Accept a connection request
router.put('/:requestId/accept', (req, res) => {
  const { requestId } = req.params;

  const query = `
    UPDATE connection_requests
    SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `;

  db.query(query, [requestId], (err, result) => {
    if (err) {
      console.error('Database error accepting request:', err);
      return res.status(500).json({ error: 'Failed to accept connection request' });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    res.json({
      success: true,
      message: 'Connection request accepted successfully'
    });
  });
});

// PUT /api/connection-requests/:requestId/decline - Decline a connection request
router.put('/:requestId/decline', (req, res) => {
  const { requestId } = req.params;

  const query = `
    UPDATE connection_requests
    SET status = 'declined', updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `;

  db.query(query, [requestId], (err, result) => {
    if (err) {
      console.error('Database error declining request:', err);
      return res.status(500).json({ error: 'Failed to decline connection request' });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    res.json({
      success: true,
      message: 'Connection request declined successfully'
    });
  });
});

// DELETE /api/connection-requests/:requestId - Cancel a sent request
router.delete('/:requestId', (req, res) => {
  const { requestId } = req.params;

  const query = `DELETE FROM connection_requests WHERE id = $1`;

  db.query(query, [requestId], (err, result) => {
    if (err) {
      console.error('Database error canceling request:', err);
      return res.status(500).json({ error: 'Failed to cancel connection request' });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    res.json({
      success: true,
      message: 'Connection request canceled successfully'
    });
  });
});

// GET /api/connection-requests/connections/:userId - Get accepted connections
router.get('/connections/:userId', (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT
      cr.id,
      cr.post_id,
      cr.created_at,
      CASE
        WHEN cr.from_user_id = $1 THEN u2.id
        ELSE u1.id
      END as connection_user_id,
      CASE
        WHEN cr.from_user_id = $1 THEN u2.name
        ELSE u1.name
      END as connection_name,
      CASE
        WHEN cr.from_user_id = $1 THEN u2.email
        ELSE u1.email
      END as connection_email,
      tp.travelling_from,
      tp.travelling_to,
      tp.travel_date
    FROM connection_requests cr
    JOIN users u1 ON cr.from_user_id = u1.id
    JOIN users u2 ON cr.to_user_id = u2.id
    JOIN travel_posts tp ON cr.post_id = tp.id
    WHERE (cr.from_user_id = $1 OR cr.to_user_id = $1)
    AND cr.status = 'accepted'
    ORDER BY cr.created_at DESC
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error('Database error fetching connections:', err);
      return res.status(500).json({ error: 'Failed to fetch connections' });
    }

    res.json(result.rows);
  });
});

module.exports = router;