require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const itemRoutes = require('./routes/itemRoutes');
const authRoutes = require("./routes/authRoutes");

// Add debug code here to check if .env is loaded
console.log('=== DEBUG: Environment Variables ===');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
console.log('PORT:', process.env.PORT);
console.log('===================================');

const app = express();
 
// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/items', itemRoutes);

// Error handling middleware
// Add this multer error handling middleware
app.use((error, req, res, next) => {
  console.log('=== MULTER ERROR HANDLER ===');
  console.log('Error:', error);
  console.log('Error message:', error.message);
  console.log('Error code:', error.code);
  
  if (error instanceof multer.MulterError) {
    console.log('Multer error type:', error.code);
    return res.status(400).json({ error: `Upload error: ${error.message}` });
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ error: error.message });
  }
  
  console.log('Other error:', error);
  res.status(500).json({ error: 'Something went wrong with file upload' });
});

// Your existing error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Connection error:', err);
  });