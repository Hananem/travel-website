const Notification = require('../models/Notification');

  // Get all notifications for the authenticated user or guide
  exports.getNotifications = async (req, res, next) => {
    try {
      const userId = req.user._id.toString();
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notification.countDocuments({ userId });

      res.status(200).json({
        success: true,
        count: notifications.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        notifications,
      });
    } catch (error) {
      console.error('Get notifications error:', error.message);
      next(error);
    }
  };

  // Mark a notification as read
  exports.markAsRead = async (req, res, next) => {
    try {
      const userId = req.user._id.toString();
      const notificationId = req.params.id;

      const notification = await Notification.findOne({ _id: notificationId, userId });
      if (!notification) {
        return res.status(404).json({ success: false, error: 'Notification not found' });
      }

      notification.read = true;
      await notification.save();

      res.status(200).json({ success: true, notification });
    } catch (error) {
      console.error('Mark as read error:', error.message);
      next(error);
    }
  };

  // Delete a notification
  exports.deleteNotification = async (req, res, next) => {
    try {
      const userId = req.user._id.toString();
      const notificationId = req.params.id;

      const notification = await Notification.findOneAndDelete({ _id: notificationId, userId });
      if (!notification) {
        return res.status(404).json({ success: false, error: 'Notification not found' });
      }

      res.status(200).json({ success: true, message: 'Notification deleted successfully' });
    } catch (error) {
      console.error('Delete notification error:', error.message);
      next(error);
    }
  };