const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Auto-create messages table if it doesn't exist
db.query(`
  CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(100) NOT NULL,
    sender_id INT NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_room (room_id),
    INDEX idx_created (created_at)
  )
`, (err) => {
  if (err) console.error("Failed to create messages table:", err.message);
});

// GET /api/messages/:roomId — fetch message history
router.get("/:roomId", (req, res) => {
  const { roomId } = req.params;
  const limit = parseInt(req.query.limit) || 50;

  db.query(
    "SELECT * FROM messages WHERE room_id = ? ORDER BY created_at ASC LIMIT ?",
    [roomId, limit],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Failed to fetch messages" });
      res.json({ messages: rows });
    }
  );
});

// POST /api/messages — persist a message
router.post("/", (req, res) => {
  const { roomId, senderId, senderName, content } = req.body;
  if (!roomId || !senderId || !senderName || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.query(
    "INSERT INTO messages (room_id, sender_id, sender_name, content) VALUES (?, ?, ?, ?)",
    [roomId, senderId, senderName, content],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to save message" });
      res.json({
        success: true,
        message: {
          id: result.insertId,
          room_id: roomId,
          sender_id: senderId,
          sender_name: senderName,
          content,
          created_at: new Date(),
        },
      });
    }
  );
});

module.exports = router;
