import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import db from './config/db.js';

dotenv.config(); // Load environment variables

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;

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

import authRoutes from './routes/auth.js';
app.use('/api/auth', authRoutes);

import bookingsRoutes from './routes/bookings.js';
app.use('/api/bookings', bookingsRoutes);

import travelPostsRoutes from './routes/travelPosts.js';
app.use('/api/travel-posts', travelPostsRoutes);

import usersRoutes from './routes/users.js';
app.use('/api/users', usersRoutes);

import connectionRequestsRoutes from './routes/connectionRequests.js';
app.use('/api/connection-requests', connectionRequestsRoutes);

import hotelBookingsRoutes from './routes/hotelBookings.js';
app.use('/api/hotelBookings', hotelBookingsRoutes);

import groupsRoutes from './routes/groups.js';
app.use('/api/groups', groupsRoutes);

import flightsRoutes from './routes/flights.js';
app.use('/api/flights', flightsRoutes);

import hotelsRoutes from './routes/hotels.js';
app.use('/api/hotels', hotelsRoutes);

import aiRoutes from './routes/ai.js';
app.use('/api/ai', aiRoutes);

import messagesRoutes from './routes/messages.js';
app.use('/api/messages', messagesRoutes);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


