const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const guideSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, unique: true, match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'] },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, default: 'guide', enum: ['guide'] },
  phone: { type: String, trim: true, default: '' },
  bio: { type: String, default: '', trim: true },
  destinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true }],
  languages: [{ type: String, trim: true }],
  experienceYears: { type: Number, default: 0, min: 0 },
  isAvailable: { type: Boolean, default: true },
  imageUrl: { type: String, default: '' }
}, { timestamps: true });

guideSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

guideSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Guide', guideSchema);