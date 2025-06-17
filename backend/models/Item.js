const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true // e.g. "Bali Adventure Tour"
  },
  description: {
    type: String,
    default: '',
    trim: true // e.g. "7-day beach and temple tour in Bali"
  },
  destination: {
    type: String,
    required: true, // e.g. "Bali, Indonesia"
    trim: true
  },
  duration: {
    type: Number,
    default: 1, // in days
    min: 1
  },
  price: {
    type: Number,
    default: 0.0,
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Reference to the Category model
    required: true // Make it required to ensure every item has a category
  },
  availableSpots: {
    type: Number,
    default: 0,
    min: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
    likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  imageUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Item', itemSchema);