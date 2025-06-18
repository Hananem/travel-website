const Message = require('../models/Message');
const Guide = require('../models/Guide');
const User = require('../models/User');
const Notification = require('../models/Notification');

const sendMessage = async (req, res, next) => {
  try {
    const { guideId, content } = req.body;
    const userId = req.user._id;
    const io = req.app.get('io');

    // Validate guide exists
    const guide = await Guide.findById(guideId);
    if (!guide) {
      return res.status(404).json({ success: false, error: 'Guide not found' });
    }

    // Create message
    const message = await Message.create({ sender: userId, receiver: guideId, content });
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username')
      .populate('receiver', 'name');

    // Determine receiver (guide or user) and create notification
    const receiverId = guideId.toString() === userId.toString() ? userId.toString() : guideId.toString();
    const sender = await User.findById(userId).select('username');
    const notificationContent = `New message from ${sender.username}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`;

    const notification = await Notification.create({
      userId: receiverId,
      content: notificationContent,
      read: false,
    });

    // Emit message to both sender and receiver
    io.to(guideId.toString()).emit('newMessage', {
      _id: populatedMessage._id,
      content: populatedMessage.content,
      createdAt: populatedMessage.createdAt,
      sender: populatedMessage.sender.username,
      receiver: populatedMessage.receiver.name,
    });
    io.to(userId.toString()).emit('newMessage', populatedMessage);

    // Emit notification to receiver
    io.to(receiverId).emit('newNotification', {
      _id: notification._id,
      userId: notification.userId,
      content: notification.content,
      read: notification.read,
      createdAt: notification.createdAt,
    });

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    console.error('Send message error:', error.message);
    next(error);
  }
};