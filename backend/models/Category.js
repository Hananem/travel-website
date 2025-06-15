const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // e.g. "Adventure Tours"
    unique: true
  },
  description: {
    type: String,
    default: '',
    trim: true // e.g. "Exciting outdoor activities and tours"
  },
  imageUrl: {
    type: String,
    default: '' // Stores Cloudinary image URL
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);