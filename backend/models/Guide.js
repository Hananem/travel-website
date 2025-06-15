// models/Guide.js
const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true // e.g., "John Doe"
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    trim: true,
    default: '' // e.g., "+1234567890"
  },
  bio: {
    type: String,
    default: '',
    trim: true // e.g., "Experienced guide specializing in cultural tours"
  },
  destinations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item', // Reference to the Item model (destinations)
    required: true
  }],
  languages: [{
    type: String,
    trim: true // e.g., ["English", "Spanish"]
  }],
  experienceYears: {
    type: Number,
    default: 0,
    min: 0 // Years of experience
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  imageUrl: {
    type: String,
    default: '' // Optional profile image
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Guide', guideSchema);