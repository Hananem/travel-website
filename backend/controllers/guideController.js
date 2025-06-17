const Guide = require('../models/Guide');
const User = require('../models/User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Get all guides with pagination and optional filtering
exports.getGuides = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.destination) {
      if (!mongoose.Types.ObjectId.isValid(req.query.destination)) {
        return res.status(400).json({ message: 'Invalid destination ID' });
      }
      filter.destinations = req.query.destination;
    }
    if (req.query.isAvailable) {
      filter.isAvailable = req.query.isAvailable === 'true';
    }
    if (req.query.language) {
      filter.languages = req.query.language;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { bio: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const guides = await Guide.find(filter)
      .populate('destinations', 'name destination')
      .skip(skip)
      .limit(limit);

    const totalGuides = await Guide.countDocuments(filter);
    const totalPages = Math.ceil(totalGuides / limit);

    res.json({
      guides,
      pagination: {
        currentPage: page,
        totalPages,
        totalGuides,
        itemsPerPage: limit
      }
    });
  } catch (err) {
    console.error('Error fetching guides:', err.message);
    res.status(500).json({ message: 'Failed to fetch guides', error: err.message });
  }
};

// Get single guide by ID
exports.getGuideById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid guide ID' });
    }
    const guide = await Guide.findById(req.params.id).populate('destinations', 'name destination');
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }
    res.json(guide);
  } catch (err) {
    console.error('Error fetching guide:', err.message);
    res.status(500).json({ message: 'Error fetching guide', error: err.message });
  }
};

// Create a new guide and corresponding user
exports.createGuide = async (req, res) => {
  console.log('=== CREATE GUIDE DEBUG START ===');
  console.log('req.file:', req.file);
  console.log('req.body:', req.body);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password, destinations, languages, experienceYears, phone, bio, isAvailable } = req.body;

    // Input validation
    if (!name || !email || !password || !destinations) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Missing required fields: name, email, password, destinations' });
    }
    if (password.length < 6) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check for existing user or guide
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Email already exists in users' });
    }

    const existingGuide = await Guide.findOne({ email: email.toLowerCase().trim() }).session(session);
    if (existingGuide) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Email already exists in guides' });
    }

    // Validate destinations
    let destinationsArray = destinations;
    if (typeof destinations === 'string') {
      destinationsArray = destinations.split(',').map(id => id.trim());
    }
    if (!Array.isArray(destinationsArray) || destinationsArray.some(id => !mongoose.Types.ObjectId.isValid(id))) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Invalid destination IDs' });
    }

    // Handle image upload
    let imageUrl = '';
    if (req.file) {
      imageUrl = req.file.path; // Cloudinary URL
      console.log('Cloudinary image URL:', imageUrl);
    }

    // Create user
    const userData = {
      username: name.trim(), // Use guide's name as username
      email: email.toLowerCase().trim(),
      password, // Hashed by User pre-save hook
      role: 'guide',
    };
    const user = new User(userData);
    const savedUser = await user.save({ session });

    // Create guide
    const guideData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // Hashed by Guide pre-save hook (assumed)
      role: 'guide',
      destinations: destinationsArray,
      languages: Array.isArray(languages) ? languages : languages?.split(',').map(lang => lang.trim()) || [],
      experienceYears: parseInt(experienceYears) || 0,
      phone: phone || '',
      bio: bio || '',
      isAvailable: isAvailable !== undefined ? isAvailable === 'true' : true,
      imageUrl,
      user: savedUser._id, // Link guide to user
    };
    const guide = new Guide(guideData);
    const savedGuide = await guide.save({ session });
    await savedGuide.populate('destinations', 'name destination');

    // Generate JWT
    const token = jwt.sign({ id: savedUser._id, role: savedUser.role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Guide and user registered successfully',
      guide: savedGuide,
      token,
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('=== ERROR DETAILS ===');
    console.error('Error message:', err.message);
    res.status(400).json({ message: 'Failed to create guide and user', error: err.message });
  }
};

// Update an existing guide
exports.updateGuide = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid guide ID' });
    }

    const updateFields = { ...req.body };
    if (req.file) {
      updateFields.imageUrl = req.file.path; // Update with new Cloudinary URL
    }

    if (req.body.destinations) {
      let destinations = req.body.destinations;
      if (typeof destinations === 'string') {
        destinations = destinations.split(',').map(id => id.trim());
      }
      if (!Array.isArray(destinations) || destinations.some(id => !mongoose.Types.ObjectId.isValid(id))) {
        return res.status(400).json({ message: 'Invalid destination IDs' });
      }
      updateFields.destinations = destinations;
    }

    const updatedGuide = await Guide.findByIdAndUpdate(req.params.id, updateFields, { new: true })
      .populate('destinations', 'name destination');

    if (!updatedGuide) {
      return res.status(404).json({ message: 'Guide not found' });
    }

    res.json(updatedGuide);
  } catch (err) {
    console.error('Error updating guide:', err.message);
    res.status(400).json({ message: 'Failed to update guide', error: err.message });
  }
};

// Delete a guide
exports.deleteGuide = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid guide ID' });
    }
    const deletedGuide = await Guide.findByIdAndDelete(req.params.id);
    if (!deletedGuide) {
      return res.status(404).json({ message: 'Guide not found' });
    }
    res.json({ message: 'Guide deleted successfully' });
  } catch (err) {
    console.error('Error deleting guide:', err.message);
    res.status(500).json({ message: 'Failed to delete guide', error: err.message });
  }
};