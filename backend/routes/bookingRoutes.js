// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, isAdmin } = require('../middleware/protect'); // Fixed: destructured import

// Create a new booking (public or protected - you decide)
router.post('/', protect, bookingController.createBooking);

// Get user's bookings (protected)
router.get('/my-bookings', protect, bookingController.getUserBookings);

// Get booking by ID (protected)
router.get('/:id', protect, bookingController.getBookingById);

// Cancel booking (protected)
router.patch('/:id/cancel', protect, bookingController.cancelBooking);

// Admin routes
router.get('/', protect, isAdmin, bookingController.getAllBookings); // Get all bookings (admin only)
router.patch('/:id/status', protect, isAdmin, bookingController.updateBookingStatus); // Update booking status (admin only)
router.get('/stats/overview', protect, isAdmin, bookingController.getBookingStats); // Get booking statistics (admin only)

module.exports = router;