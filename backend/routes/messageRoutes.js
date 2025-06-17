const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/protect');
const {
  sendMessage,
  getConversation,
  getConversations
} = require('../controllers/messageController');

router.route('/')
  .post(protect, sendMessage);

router.route('/conversations')
  .get(protect, getConversations);

router.route('/guides/:guideId')
  .get(protect, getConversation);

module.exports = router;