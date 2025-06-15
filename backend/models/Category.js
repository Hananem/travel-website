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
  timestamps: true,
  toJSON: { virtuals: true } // Enable virtuals for toJSON
});

// Optional: Virtual to get all items in this category
categorySchema.virtual('items', {
  ref: 'Item', // Reference to the Item model
  localField: '_id', // The field in Category
  foreignField: 'category' // The field in Item that references Category
});

module.exports = mongoose.model('Category', categorySchema);