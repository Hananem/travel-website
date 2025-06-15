// controllers/guideController.js
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
      // Validate ObjectId
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
      imageUrl = req.file.path; // Cloudinary returns the secure URL in req.file.path
      console.log('Cloudinary image URL:', imageUrl);
    }

    // Validate and process destinations
    let destinations = req.body.destinations;
    if (typeof destinations === 'string') {
      destinations = destinations.split(',').map(id => id.trim());
    }
    if (!Array.isArray(destinations) || destinations.some(id => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ message: 'Invalid destination IDs' });
    }

    const guideData = {
      ...req.body,
      destinations,
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
    res.status(500).json({ message: 'Failed to delete guide', error: err.message });
  }
};