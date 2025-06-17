const Guide = require('../models/Guide');
const mongoose = require('mongoose');

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

// Create a new guide
exports.createGuide = async (req, res) => {
  console.log('=== CREATE GUIDE DEBUG START ===');
  console.log('req.file:', req.file);
  console.log('req.body:', req.body);

  try {
    let imageUrl = '';
    if (req.file) {
      imageUrl = req.file.path; // Cloudinary URL
      console.log('Cloudinary image URL:', imageUrl);
    }

    const { name, email, password, destinations, languages, experienceYears, phone, bio, isAvailable } = req.body;
    if (!name || !email || !password || !destinations) {
      return res.status(400).json({ message: 'Missing required fields: name, email, password, destinations' });
    }

    const existingGuide = await Guide.findOne({ email });
    if (existingGuide) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    let destinationsArray = destinations;
    if (typeof destinations === 'string') {
      destinationsArray = destinations.split(',').map(id => id.trim());
    }
    if (!Array.isArray(destinationsArray) || destinationsArray.some(id => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ message: 'Invalid destination IDs' });
    }

    const guideData = {
      name,
      email,
      password, // Hashed by Guide.js pre-save hook
      role: 'guide',
      destinations: destinationsArray,
      languages: Array.isArray(languages) ? languages : languages?.split(',').map(lang => lang.trim()) || [],
      experienceYears: parseInt(experienceYears) || 0,
      phone: phone || '',
      bio: bio || '',
      isAvailable: isAvailable !== undefined ? isAvailable === 'true' : true,
      imageUrl
    };

    const guide = new Guide(guideData);
    const savedGuide = await guide.save();
    await savedGuide.populate('destinations', 'name destination');
    res.status(201).json(savedGuide);
  } catch (err) {
    console.error('=== ERROR DETAILS ===');
    console.error('Error message:', err.message);
    res.status(400).json({ message: 'Failed to create guide', error: err.message });
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