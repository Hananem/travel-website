// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, isAdmin } = require('../middleware/protect');

// User booking routes
router.post('/', protect, bookingController.createBooking);
router.get('/my-bookings', protect, bookingController.getUserBookings);
router.get('/:id', protect, bookingController.getBookingById);
router.patch('/:id/cancel', protect, bookingController.cancelBooking);

// Admin booking routes
router.get('/', protect, isAdmin, bookingController.getAllBookings);
router.get('/user/:userId', protect, isAdmin, bookingController.getBookingByUser); // New route
router.patch('/:id/status', protect, isAdmin, bookingController.updateBookingStatus);
router.get('/stats/overview', protect, isAdmin, bookingController.getBookingStats);

module.exports = router;