import express from "express";
import db from "../config/db.js";

const router = express.Router();

// Auto-create messages table if it doesn't exist (PostgreSQL syntax)
db.query(`
  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(100) NOT NULL,
    sender_id INT NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) console.error("Failed to create messages table:", err.message);
});

db.query(`CREATE INDEX IF NOT EXISTS idx_room ON messages(room_id)`, (err) => {
  if (err) console.error("Failed to create index:", err.message);
});

// GET /api/messages/:roomId — fetch message history
router.get("/:roomId", (req, res) => {
  const { roomId } = req.params;
  const limit = parseInt(req.query.limit) || 50;

  db.query(
    "SELECT * FROM messages WHERE room_id = $1 ORDER BY created_at ASC LIMIT $2",
    [roomId, limit],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to fetch messages" });
      res.json({ messages: result.rows });
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
    "INSERT INTO messages (room_id, sender_id, sender_name, content) VALUES ($1, $2, $3, $4) RETURNING id, created_at",
    [roomId, senderId, senderName, content],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to save message" });
      const row = result.rows[0];
      res.json({
        success: true,
        message: {
          id: row.id,
          room_id: roomId,
          sender_id: senderId,
          sender_name: senderName,
          content,
          created_at: row.created_at,
        },
      });
    }
  );
});

export default router;
