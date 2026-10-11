const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/unread-count', authenticate, messageController.getUnreadCount);
router.get('/contacts', authenticate, messageController.getChatContacts);
router.get('/:partnerId', authenticate, messageController.getMessages);
router.post('/', authenticate, messageController.sendMessage);

module.exports = router;
