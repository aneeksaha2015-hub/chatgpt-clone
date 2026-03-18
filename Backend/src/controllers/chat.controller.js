const chatModel = require('../models/chat.model')
const messageModel = require('../models/message.model')

async function createChat(req, res) {
    const { title } = req.body;
    const user = req.user;

    const chat = await chatModel.create({
        user: user._id,
        title
    })

    res.status(201).json({
        message: "Chat created successfully!",
        chat: {
            _id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.user,
        }
    })
}

async function getChats(req, res) {
    const user = req.user;
    const chats = await chatModel
        .find({ user: user._id })
        .sort({ lastActivity: -1 })
    res.status(200).json({ chats })
}

async function getChatMessages(req, res) {
    const { chatId } = req.params;
    const messages = await messageModel
        .find({ chat: chatId })
        .sort({ createdAt: 1 })
    res.status(200).json({ messages })
}

async function deleteChat(req, res) {
    const { chatId } = req.params;
    const user = req.user;

    const chat = await chatModel.findOne({ _id: chatId, user: user._id })

    if (!chat) {
        return res.status(404).json({ message: "Chat not found!" })
    }

    await messageModel.deleteMany({ chat: chatId })
    await chatModel.findByIdAndDelete(chatId)

    res.status(200).json({ message: "Chat deleted successfully!" })
}

module.exports = {
    createChat,
    getChats,
    getChatMessages,
    deleteChat
}