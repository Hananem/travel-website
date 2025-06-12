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
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.destination) {
      filter.destination = req.query.destination;
    }
    if (req.query.isAvailable) {
      filter.isAvailable = req.query.isAvailable === 'true';
    }

    const items = await Item.find(filter)
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
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build the filter object based on query parameters
    const filter = {};
    
    // Exact match filters
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.destination) {
      filter.destination = req.query.destination;
    }
    if (req.query.isAvailable) {
      filter.isAvailable = req.query.isAvailable === 'true';
    }
    
    // Range filters
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) {
        filter.price.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filter.price.$lte = parseFloat(req.query.maxPrice);
      }
    }
    
    if (req.query.minDuration || req.query.maxDuration) {
      filter.duration = {};
      if (req.query.minDuration) {
        filter.duration.$gte = parseInt(req.query.minDuration);
      }
      if (req.query.maxDuration) {
        filter.duration.$lte = parseInt(req.query.maxDuration);
      }
    }
    
    // Text search
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Sorting
    let sort = {};
    if (req.query.sortBy) {
      const sortFields = req.query.sortBy.split(',');
      sortFields.forEach(field => {
        const [key, order] = field.split(':');
        sort[key] = order === 'desc' ? -1 : 1;
      });
    } else {
      sort = { createdAt: -1 }; // Default sort by newest
    }

    const items = await Item.find(filter)
      .sort(sort)
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
    res.status(500).json({ message: 'Failed to fetch items with filters', error: err.message });
  }
};

// Get single item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
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
    let imageUrl = "";
    
    if (req.file) {
      console.log('Processing file...');
      console.log('req.file.path:', req.file.path);
      console.log('req.file.secure_url:', req.file.secure_url);
      imageUrl = req.file.path;
      console.log('Set imageUrl to:', imageUrl);
    } else {
      console.log('No file uploaded');
    }
    
    console.log('Creating item with:');
    console.log('Body data:', req.body);
    console.log('Image URL:', imageUrl);
    
    const itemData = {
      ...req.body,
      imageUrl
    };
    
    console.log('Final item data:', itemData);
    
    const Item = require('../models/Item'); // Make sure this path is correct
    const item = new Item(itemData);
    console.log('Item object created:', item);
    
    const savedItem = await item.save();
    console.log('Item saved successfully:', savedItem);
    
    res.status(201).json(savedItem);
    
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
      category,
      availableSpots,
      isAvailable,
    } = req.body;

    const updateFields = {
      name,
      description,
      destination,
      duration,
      price,
      category,
      availableSpots,
      isAvailable,
    };

    // If a new image was uploaded, update the URL
    if (req.file) {
      updateFields.imageUrl = req.file.path;
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, updateFields, { new: true });

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: "Failed to update item", error: err.message });
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

