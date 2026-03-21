const express = require('express');
const { requireAuth } = require('../middlewares/authMiddleware');
const { getChats, createChat, getMessages, sendMessage, updateChat, deleteChat } = require('../controllers/chatController');

const router = express.Router();

router.use(requireAuth);

router.get('/', getChats);
router.post('/', createChat);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);
router.put('/:id', updateChat);
router.delete('/:id', deleteChat);

module.exports = router;
