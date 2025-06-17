const Message = require('../models/Message');
const Guide = require('../models/Guide');
const User = require('../models/User');

const sendMessage = async (req, res, next) => {
  try {
    const { guideId, content } = req.body;
    const userId = req.user._id;
    const io = req.app.get('io');

    const guide = await Guide.findById(guideId);
    if (!guide) {
      return res.status(404).json({ success: false, error: 'Guide not found' });
    }

    const message = await Message.create({ sender: userId, receiver: guideId, content });
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username')
      .populate('receiver', 'name');

    io.to(guideId.toString()).emit('newMessage', {
      _id: populatedMessage._id,
      content: populatedMessage.content,
      createdAt: populatedMessage.createdAt,
      sender: populatedMessage.sender.username,
      receiver: populatedMessage.receiver.name,
    });
    io.to(userId.toString()).emit('newMessage', populatedMessage);

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    next(error);
  }
};

const getConversation = async (req, res, next) => {
  try {
    const { guideId } = req.params;
    const userId = req.user._id;

    const guide = await Guide.findById(guideId);
    if (!guide) {
      return res.status(404).json({ success: false, error: 'Guide not found' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [{ sender: userId, receiver: guideId }, { sender: guideId, receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username')
      .populate('receiver', 'name');

    const total = await Message.countDocuments({
      $or: [{ sender: userId, receiver: guideId }, { sender: guideId, receiver: userId }],
    });

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      messages: messages.reverse(),
    });
  } catch (error) {
    next(error);
  }
};

const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const guides = await Message.aggregate([
      { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
      {
        $group: {
          _id: { $cond: [{ $eq: ['$sender', userId] }, '$receiver', '$sender'] },
          lastMessage: { $last: '$$ROOT' },
          unreadCount: {
            $sum: { $cond: [{ $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$isRead', false] }] }, 1, 0] },
          },
        },
      },
      { $lookup: { from: 'guides', localField: '_id', foreignField: '_id', as: 'guide' } },
      { $unwind: '$guide' },
      { $sort: { 'lastMessage.createdAt': -1 } },
    ]);

    res.status(200).json({
      success: true,
      count: guides.length,
      conversations: guides.map((conv) => ({
        guideId: conv._id,
        guideName: conv.guide.name,
        guideImage: conv.guide.imageUrl,
        lastMessage: conv.lastMessage.content,
        lastMessageAt: conv.lastMessage.createdAt,
        unreadCount: conv.unreadCount,
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getConversation, getConversations };