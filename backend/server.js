require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const itemRoutes = require('./routes/itemRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const guideRoutes = require('./routes/guideRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const messageRoutes = require('./routes/messageRoutes'); // Add message routes



const app = express();
const server = http.createServer(app); // Use HTTP server for Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Adjust to your frontend URL
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/messages', messageRoutes); // Add message routes

// Multer error handling middleware
app.use((error, req, res, next) => {
  console.log('=== MULTER ERROR HANDLER ===');
  console.log('Error:', error);
  console.log('Error message:', error.message);
  console.log('Error code:', error.code);

  if (error instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${error.message}` });
  }

  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ error: error.message });
  }

  res.status(500).json({ error: 'Something went wrong with file upload' });
});

// General error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Socket.IO setup
io.on('connection', (socket) => {
  console.log(`✅ Socket.IO: New client connected - Socket ID: ${socket.id} at ${new Date().toISOString()}`);

  socket.on('join', (userId) => {
    socket.join(userId.toString());
    console.log(`✅ Socket.IO: User ${userId} joined room ${userId.toString()} at ${new Date().toISOString()}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket.IO: Client disconnected - Socket ID: ${socket.id} at ${new Date().toISOString()}`);
  });
});
// Make io accessible to routes
app.set('io', io);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    server.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Connection error:', err);
  });