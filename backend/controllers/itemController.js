const mongoose = require('mongoose');
const Item = require('../models/Item');

// Get all items with pagination and optional filtering
exports.getItems = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Basic filtering
    const filter = {};
    if (req.query.categoryId) {
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(req.query.categoryId)) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }
      filter.category = req.query.categoryId;
    }
    if (req.query.destination) {
      filter.destination = req.query.destination;
    }
    if (req.query.isAvailable) {
      filter.isAvailable = req.query.isAvailable === 'true';
    }

    const items = await Item.find(filter)
      .populate('category') // Populate category details
      .skip(skip)
      .limit(limit);

    const totalItems = await Item.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      items,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch items', error: err.message });
  }
};

// Get items with multiple filters
exports.getItemsWithFilters = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt:desc',
      category,
      destination,
      isAvailable,
      minPrice,
      maxPrice,
      minDuration,
      maxDuration,
      search,
    } = req.query;

    const [sortField, sortOrder] = sortBy.split(':');
    const validSortFields = ['createdAt', 'price', 'duration', 'name'];
    if (!validSortFields.includes(sortField)) {
      return res.status(400).json({ error: 'Invalid sort field' });
    }

    const query = {};
    if (category) query.category = category; // Assumes category is an ID or string
    if (destination) query.destination = destination;
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';
    if (minPrice) query.price = { ...query.price, $gte: Number(minPrice) || 0 };
    if (maxPrice) query.price = { ...query.price, $lte: Number(maxPrice) || Infinity };
    if (minDuration) query.duration = { ...query.duration, $gte: Number(minDuration) || 0 };
    if (maxDuration) query.duration = { ...query.duration, $lte: Number(maxDuration) || Infinity };
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    const items = await Item.find(query)
      .populate('category') // Populate category field
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const totalItems = await Item.countDocuments(query);

    res.json({
      items,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / Number(limit)),
        currentPage: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error('Error in getItemsWithFilters:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get single item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('category');
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching item', error: err.message });
  }
};

// Create a new item
exports.createItem = async (req, res) => {
  console.log('=== CREATE ITEM DEBUG START ===');
  console.log('req.file exists:', !!req.file);
  console.log('req.file:', req.file);
  console.log('req.body:', req.body);
  console.log('req.body type:', typeof req.body);

  if (req.body) {
    console.log('req.body keys:', Object.keys(req.body));
    Object.keys(req.body).forEach(key => {
      console.log(`${key}:`, req.body[key], '(type:', typeof req.body[key], ')');
    });
  }

  try {
    let imageUrl = '';

    if (req.file) {
      console.log('Processing file...');
      console.log('req.file.path:', req.file.path);
      console.log('req.file.secure_url:', req.file.secure_url);
      imageUrl = req.file.path;
      console.log('Set imageUrl to:', imageUrl);
    } else {
      console.log('No file uploaded');
    }

    // Validate categoryId
    if (!req.body.categoryId || !mongoose.Types.ObjectId.isValid(req.body.categoryId)) {
      return res.status(400).json({ message: 'Valid category ID is required' });
    }

    console.log('Creating item with:');
    console.log('Body data:', req.body);
    console.log('Image URL:', imageUrl);

    const itemData = {
      name: req.body.name,
      description: req.body.description,
      destination: req.body.destination,
      duration: req.body.duration ? parseInt(req.body.duration) : 1,
      price: req.body.price ? parseFloat(req.body.price) : 0.0,
      category: req.body.categoryId, // Use categoryId as ObjectId
      availableSpots: req.body.availableSpots ? parseInt(req.body.availableSpots) : 0,
      isAvailable: req.body.isAvailable === 'true' || req.body.isAvailable === true,
      imageUrl
    };

    console.log('Final item data:', itemData);

    const item = new Item(itemData);
    console.log('Item object created:', item);

    const savedItem = await item.save();
    console.log('Item saved successfully:', savedItem);

    // Populate category in response
    const populatedItem = await Item.findById(savedItem._id).populate('category');
    res.status(201).json(populatedItem);

  } catch (err) {
    console.error('=== ERROR DETAILS ===');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);

    if (err.errors) {
      console.error('Validation errors:', err.errors);
    }

    console.error('====================');
    res.status(400).json({ error: err.message, details: err.errors });
  }

  console.log('=== CREATE ITEM DEBUG END ===');
};

// Update an existing item
exports.updateItem = async (req, res) => {
  try {
    const {
      name,
      description,
      destination,
      duration,
      price,
      categoryId,
      availableSpots,
      isAvailable,
    } = req.body;

    // Validate categoryId if provided
    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const updateFields = {
      name,
      description,
      destination,
      duration: duration ? parseInt(duration) : undefined,
      price: price ? parseFloat(price) : undefined,
      category: categoryId, // Use categoryId as ObjectId
      availableSpots: availableSpots ? parseInt(availableSpots) : undefined,
      isAvailable: isAvailable === 'true' || isAvailable === true,
    };

    // If a new image was uploaded, update the URL
    if (req.file) {
      updateFields.imageUrl = req.file.path;
    }

    // Remove undefined fields to prevent overwriting with undefined
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, updateFields, { new: true }).populate('category');

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update item', error: err.message });
  }
};

// Delete an item
exports.deleteItem = async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete item', error: err.message });
  }
};
