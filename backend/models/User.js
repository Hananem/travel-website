const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  isAdmin: {
    type: Boolean,
    default: false  // Most users won't be admins
  },
  likedItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    default: []
  }],
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { 
  timestamps: true 
});

module.exports = mongoose.model("User", userSchema);