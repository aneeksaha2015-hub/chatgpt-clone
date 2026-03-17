const express = require('express')
const authMiddlewar = require('../middlewares/auth.middleware')
const chatController = require('../controllers/chat.controller')

const router = express.Router();

router.post('/', authMiddlewar.authUser, chatController.createChat)

module.exports = router;