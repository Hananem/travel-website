const express = require('express');
  const router = express.Router();
  const { getNotifications, markAsRead, deleteNotification } = require('../controllers/notificationController');
  const { protect } = require('../middleware/protect'); 

  router.get('/', protect, getNotifications);
  router.put('/:id/read', protect, markAsRead);
  router.delete('/:id', protect, deleteNotification);

  module.exports = router;
  