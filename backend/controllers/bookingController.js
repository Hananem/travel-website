// controllers/bookingController.js
const Booking = require('../models/Booking');
const Item = require('../models/Item');
const User = require('../models/User');

const bookingController = {
  // Create a new booking
  createBooking: async (req, res) => {
    try {
      const { itemId, bookingDate, numberOfPeople, customerInfo } = req.body;
      const userId = req.user.id; // Assuming user is authenticated

      // Check if item exists and is available
      const item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      if (!item.isAvailable) {
        return res.status(400).json({ error: 'Item is not available for booking' });
      }

      // Check available spots
      if (item.availableSpots < numberOfPeople) {
        return res.status(400).json({ 
          error: `Only ${item.availableSpots} spots available, requested ${numberOfPeople}` 
        });
      }

      // Calculate total price
      const totalPrice = item.price * numberOfPeople;

      // Create booking
      const booking = new Booking({
        user: userId,
        item: itemId,
        bookingDate: new Date(bookingDate),
        numberOfPeople,
        totalPrice,
        customerInfo
      });

      await booking.save();

      // Update item available spots
      item.availableSpots -= numberOfPeople;
      if (item.availableSpots === 0) {
        item.isAvailable = false;
      }
      await item.save();

      // Populate booking details for response
      const populatedBooking = await Booking.findById(booking._id)
        .populate('user', 'username email')
        .populate('item', 'name destination price');

      res.status(201).json({
        message: 'Booking created successfully',
        booking: populatedBooking
      });

    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all bookings for a user
  getUserBookings: async (req, res) => {
    try {
      const userId = req.user.id;
      const { status, page = 1, limit = 10 } = req.query;

      const query = { user: userId };
      if (status) {
        query.status = status;
      }

      const bookings = await Booking.find(query)
        .populate('item', 'name destination price imageUrl duration')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Booking.countDocuments(query);

      res.json({
        bookings,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });

    } catch (error) {
      console.error('Error fetching user bookings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all bookings (admin)
  getAllBookings: async (req, res) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;

      const query = {};
      if (status) {
        query.status = status;
      }

      const bookings = await Booking.find(query)
        .populate('user', 'username email')
        .populate('item', 'name destination price')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Booking.countDocuments(query);

      res.json({
        bookings,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });

    } catch (error) {
      console.error('Error fetching all bookings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get booking by ID
  getBookingById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const booking = await Booking.findById(id)
        .populate('user', 'username email')
        .populate('item', 'name destination price imageUrl duration description');

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Check if user owns this booking (unless admin)
      if (booking.user._id.toString() !== userId && !req.user.isAdmin) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ booking });

    } catch (error) {
      console.error('Error fetching booking:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update booking status
  updateBookingStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, paymentStatus } = req.body;

      const booking = await Booking.findById(id);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Update status if provided
      if (status) {
        booking.status = status;
      }

      // Update payment status if provided
      if (paymentStatus) {
        booking.paymentStatus = paymentStatus;
      }

      await booking.save();

      // If booking is cancelled, restore item spots
      if (status === 'cancelled') {
        const item = await Item.findById(booking.item);
        if (item) {
          item.availableSpots += booking.numberOfPeople;
          item.isAvailable = true;
          await item.save();
        }
      }

      const updatedBooking = await Booking.findById(id)
        .populate('user', 'username email')
        .populate('item', 'name destination price');

      res.json({
        message: 'Booking updated successfully',
        booking: updatedBooking
      });

    } catch (error) {
      console.error('Error updating booking:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Cancel booking
  cancelBooking: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const booking = await Booking.findById(id);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Check if user owns this booking
      if (booking.user.toString() !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Check if booking can be cancelled
      if (booking.status === 'completed' || booking.status === 'cancelled') {
        return res.status(400).json({ 
          error: `Cannot cancel booking with status: ${booking.status}` 
        });
      }

      // Update booking status
      booking.status = 'cancelled';
      await booking.save();

      // Restore item spots
      const item = await Item.findById(booking.item);
      if (item) {
        item.availableSpots += booking.numberOfPeople;
        item.isAvailable = true;
        await item.save();
      }

      res.json({
        message: 'Booking cancelled successfully',
        booking
      });

    } catch (error) {
      console.error('Error cancelling booking:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get booking statistics (admin)
  getBookingStats: async (req, res) => {
    try {
      const stats = await Booking.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$totalPrice' }
          }
        }
      ]);

      const totalBookings = await Booking.countDocuments();
      const totalRevenue = await Booking.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]);

      res.json({
        stats,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0
      });

    } catch (error) {
      console.error('Error fetching booking stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all bookings for a specific user (admin function)
getBookingByUser: async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      status, 
      paymentStatus,
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Check if the requesting user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    // Verify the user exists
    const user = await User.findById(userId).select('username email role');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const query = { user: userId };
    
    // Add status filter if provided
    if (status) {
      if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
      query.status = status;
    }

    // Add payment status filter if provided
    if (paymentStatus) {
      if (!['pending', 'paid', 'failed', 'refunded'].includes(paymentStatus)) {
        return res.status(400).json({ error: 'Invalid payment status value' });
      }
      query.paymentStatus = paymentStatus;
    }

    // Validate sort fields
    const validSortFields = ['createdAt', 'bookingDate', 'totalPrice', 'numberOfPeople'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const bookings = await Booking.find(query)
      .populate('item', 'name destination price imageUrl duration')
      .sort({ [sortField]: sortDirection })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean(); // Using lean() for better performance

    // Calculate total count for pagination
    const total = await Booking.countDocuments(query);

    // Format booking dates and add additional metadata if needed
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      bookingDate: booking.bookingDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString()
    }));

    res.json({
      success: true,
      bookings: formattedBookings,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        totalBookings: total,
        limit: Number(limit)
      },
      userInfo: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      filters: {
        status: status || 'all',
        paymentStatus: paymentStatus || 'all'
      }
    });

  } catch (error) {
    console.error('Error fetching bookings by user:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
},
};

module.exports = bookingController;
