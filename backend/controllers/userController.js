const Item = require('../models/Item');
const User = require('../models/User');

// @desc    Get all users with pagination/filters (Admin)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { username: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.isAdmin) {
      filter.isAdmin = req.query.isAdmin === 'true';
    }

    // Sorting
    const sort = {};
    if (req.query.sortBy) {
      const sortFields = req.query.sortBy.split(':');
      sort[sortFields[0]] = sortFields[1] === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default: newest first
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort(sort),
      User.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's liked items with pagination/filters
// @route   GET /api/users/me/likes
// @access  Private
const getLikedItems = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const itemFilter = {};
    if (req.query.search) {
      itemFilter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { destination: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.minPrice) {
      itemFilter.price = { $gte: Number(req.query.minPrice) };
    }
    if (req.query.maxPrice) {
      itemFilter.price = { ...itemFilter.price, $lte: Number(req.query.maxPrice) };
    }

    const user = await User.findById(req.user._id)
      .populate({
        path: 'likedItems',
        match: itemFilter,
        select: 'name destination price imageUrl duration',
        options: {
          skip,
          limit,
          sort: req.query.sortBy || '-createdAt' // Default: newest first
        }
      });

    // Get accurate count considering filters
    const likedItemsCount = await User.aggregate([
      { $match: { _id: req.user._id } },
      { $project: { count: { $size: '$likedItems' } } }
    ]);

    res.status(200).json({
      success: true,
      count: user.likedItems.length,
      total: likedItemsCount[0]?.count || 0,
      page,
      pages: Math.ceil((likedItemsCount[0]?.count || 0) / limit),
      items: user.likedItems
    });
  } catch (error) {
    next(error);
  }
};

// ... (rest of the controller functions remain the same) ...const User = require('../models/User');



// @desc    Get single user (Admin)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        username: req.body.username,
        email: req.body.email,
        isAdmin: req.body.isAdmin
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like on item
// @route   POST /api/users/likes/:itemId
// @access  Private
const toggleItemLike = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const userId = req.user._id;

    const [item, user] = await Promise.all([
      Item.findById(itemId),
      User.findById(userId)
    ]);

    if (!item || !user) {
      return res.status(404).json({ 
        success: false,
        error: item ? 'User not found' : 'Item not found'
      });
    }

    const isLiked = user.likedItems.includes(itemId);

    if (isLiked) {
      user.likedItems.pull(itemId);
      item.likedBy.pull(userId);
    } else {
      user.likedItems.push(itemId);
      item.likedBy.push(userId);
    }

    await Promise.all([user.save(), item.save()]);

    res.status(200).json({
      success: true,
      isLiked: !isLiked,
      likesCount: item.likedBy.length
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleItemLike,
  getLikedItems
};