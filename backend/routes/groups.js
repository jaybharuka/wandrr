const express = require('express');
const router = express.Router();
const db = require('../config/db');
const crypto = require('crypto');

const generateJoinCode = () => crypto.randomBytes(4).toString('hex').toUpperCase();

// POST /api/groups - Create a new travel group
router.post('/', (req, res) => {
  const { userId, name, destination, description, isPrivate, maxMembers } = req.body;

  if (!userId || !name || !destination) {
    return res.status(400).json({ error: 'userId, name, and destination are required.' });
  }

  const joinCode = generateJoinCode();

  const insertQuery = `
    INSERT INTO travel_groups (name, destination, description, created_by, join_code, is_private, max_members)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(insertQuery, [name, destination, description || '', userId, joinCode, isPrivate ? 1 : 0, maxMembers || 20], (err, result) => {
    if (err) {
      console.error('Error creating group:', err);
      return res.status(500).json({ error: 'Failed to create group.' });
    }

    const groupId = result.insertId;

    // Auto-add creator as member
    db.query('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)', [groupId, userId], (err2) => {
      if (err2) console.error('Error adding creator as member:', err2);

      res.status(201).json({
        success: true,
        message: 'Group created successfully!',
        group: { id: groupId, name, destination, joinCode, isPrivate: !!isPrivate }
      });
    });
  });
});

// POST /api/groups/join - Join a group by join code
router.post('/join', (req, res) => {
  const { userId, joinCode } = req.body;

  if (!userId || !joinCode) {
    return res.status(400).json({ error: 'userId and joinCode are required.' });
  }

  db.query('SELECT * FROM travel_groups WHERE join_code = ?', [joinCode.toUpperCase()], (err, groups) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    if (groups.length === 0) return res.status(404).json({ error: 'Invalid join code. Group not found.' });

    const group = groups[0];

    // Check member count
    db.query('SELECT COUNT(*) as count FROM group_members WHERE group_id = ?', [group.id], (err2, countResult) => {
      if (err2) return res.status(500).json({ error: 'Database error.' });

      if (countResult[0].count >= group.max_members) {
        return res.status(400).json({ error: 'This group is full.' });
      }

      db.query('INSERT IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)', [group.id, userId], (err3, insertResult) => {
        if (err3) return res.status(500).json({ error: 'Failed to join group.' });

        if (insertResult.affectedRows === 0) {
          return res.status(400).json({ error: 'You are already a member of this group.' });
        }

        res.json({
          success: true,
          message: `Joined "${group.name}" successfully!`,
          group: { id: group.id, name: group.name, destination: group.destination, joinCode: group.join_code }
        });
      });
    });
  });
});

// GET /api/groups/user/:userId - Get all groups for a user
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT 
      tg.id, tg.name, tg.destination, tg.description,
      tg.join_code, tg.is_private, tg.max_members, tg.created_at,
      tg.created_by,
      u.name as creator_name,
      (SELECT COUNT(*) FROM group_members gm2 WHERE gm2.group_id = tg.id) as member_count
    FROM travel_groups tg
    JOIN group_members gm ON tg.id = gm.group_id
    JOIN users u ON tg.created_by = u.id
    WHERE gm.user_id = ?
    ORDER BY tg.created_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user groups:', err);
      return res.status(500).json({ error: 'Failed to fetch groups.' });
    }
    res.json({ groups: results });
  });
});

// GET /api/groups/destination/:destination - Get public groups for a destination
router.get('/destination/:destination', (req, res) => {
  const { destination } = req.params;

  const query = `
    SELECT 
      tg.id, tg.name, tg.destination, tg.description,
      tg.join_code, tg.max_members, tg.created_at,
      u.name as creator_name,
      (SELECT COUNT(*) FROM group_members gm2 WHERE gm2.group_id = tg.id) as member_count
    FROM travel_groups tg
    JOIN users u ON tg.created_by = u.id
    WHERE tg.destination LIKE ? AND tg.is_private = 0
    ORDER BY tg.created_at DESC
    LIMIT 20
  `;

  db.query(query, [`%${destination}%`], (err, results) => {
    if (err) {
      console.error('Error fetching destination groups:', err);
      return res.status(500).json({ error: 'Failed to fetch groups.' });
    }
    res.json({ groups: results });
  });
});

// DELETE /api/groups/:groupId/leave - Leave a group
router.delete('/:groupId/leave', (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: 'userId is required.' });

  db.query('SELECT created_by FROM travel_groups WHERE id = ?', [groupId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    if (rows.length === 0) return res.status(404).json({ error: 'Group not found.' });

    if (String(rows[0].created_by) === String(userId)) {
      return res.status(400).json({ error: 'You created this group. Delete it instead of leaving.' });
    }

    db.query('DELETE FROM group_members WHERE group_id = ? AND user_id = ?', [groupId, userId], (err2, result) => {
      if (err2) return res.status(500).json({ error: 'Failed to leave group.' });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'You are not a member of this group.' });
      res.json({ success: true, message: 'Left group successfully.' });
    });
  });
});

// DELETE /api/groups/:groupId - Delete a group (owner only)
router.delete('/:groupId', (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: 'userId is required.' });

  db.query('SELECT created_by FROM travel_groups WHERE id = ?', [groupId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    if (rows.length === 0) return res.status(404).json({ error: 'Group not found.' });

    if (String(rows[0].created_by) !== String(userId)) {
      return res.status(403).json({ error: 'Only the group owner can delete this group.' });
    }

    db.query('DELETE FROM travel_groups WHERE id = ?', [groupId], (err2, result) => {
      if (err2) return res.status(500).json({ error: 'Failed to delete group.' });
      res.json({ success: true, message: 'Group deleted successfully.' });
    });
  });
});

module.exports = router;
