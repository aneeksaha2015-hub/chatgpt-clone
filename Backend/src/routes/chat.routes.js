const express = require('express')
const authMiddleware = require('../middlewares/auth.middleware')
const chatController = require('../controllers/chat.controller')

const router = express.Router();

router.post('/', authMiddleware.authUser, chatController.createChat)
router.get('/', authMiddleware.authUser, chatController.getChats)
router.get('/:chatId/messages', authMiddleware.authUser, chatController.getChatMessages)
router.delete('/:chatId', authMiddleware.authUser, chatController.deleteChat)
router.patch('/:chatId/rename', authMiddleware.authUser, chatController.renameChat)
router.patch('/:chatId/pin', authMiddleware.authUser, chatController.pinChat)

module.exports = router;