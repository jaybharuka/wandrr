const express = require("express");
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config(); // Load environment variables
const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;
const db = require('./config/db');

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json()); // For parsing JSON bodies, needed for POST requests

app.get("/", (req, res) => {
  res.send("Wandrr Backend is running 🚀");
});

// Socket.io chat
io.on('connection', (socket) => {
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('send_message', async (data) => {
    const { roomId, senderId, senderName, content } = data;
    if (!roomId || !senderId || !senderName || !content) return;

    const message = {
      id: Date.now(),
      room_id: roomId,
      sender_id: senderId,
      sender_name: senderName,
      content,
      created_at: new Date(),
    };

    // Persist to DB
    db.query(
      'INSERT INTO messages (room_id, sender_id, sender_name, content) VALUES (?, ?, ?, ?)',
      [roomId, senderId, senderName, content],
      (err, result) => {
        if (!err) message.id = result.insertId;
      }
    );

    io.to(roomId).emit('receive_message', message);
  });

  socket.on('disconnect', () => {});
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const bookingsRoutes = require('./routes/bookings');
app.use('/api/bookings', bookingsRoutes);

const travelPostsRoutes = require('./routes/travelPosts');
app.use('/api/travel-posts', travelPostsRoutes);

const usersRoutes = require('./routes/users');
app.use('/api/users', usersRoutes);

const connectionRequestsRoutes = require('./routes/connectionRequests');
app.use('/api/connection-requests', connectionRequestsRoutes);

const hotelBookingsRoutes = require('./routes/hotelBookings');
app.use('/api/hotelBookings', hotelBookingsRoutes);

const groupsRoutes = require('./routes/groups');
app.use('/api/groups', groupsRoutes);

const flightsRoutes = require('./routes/flights');
app.use('/api/flights', flightsRoutes);

const hotelsRoutes = require('./routes/hotels');
app.use('/api/hotels', hotelsRoutes);

const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes);

const messagesRoutes = require('./routes/messages');
app.use('/api/messages', messagesRoutes);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


