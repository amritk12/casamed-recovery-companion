const router = require('express').Router();
const { sendMessage, getChatHistory } = require('../controllers/chatController');

router.post('/', sendMessage);
router.get('/:sessionId', getChatHistory);

module.exports = router;