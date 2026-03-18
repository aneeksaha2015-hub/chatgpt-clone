const chatModel = require('../models/chat.model')
const messageModel = require('../models/message.model')

async function createChat(req, res) {
    const { title } = req.body;
    const user = req.user;

    const chat = await chatModel.create({ user: user._id, title })

    // Keep only 6 chats — delete oldest if exceeded
    const allChats = await chatModel
        .find({ user: user._id })
        .sort({ pinned: -1, lastActivity: -1 })

    if (allChats.length > 6) {
        const toDelete = allChats.slice(6);
        for (const oldChat of toDelete) {
            await messageModel.deleteMany({ chat: oldChat._id })
            await chatModel.findByIdAndDelete(oldChat._id)
        }
    }

    res.status(201).json({
        message: "Chat created successfully!",
        chat: {
            _id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.user,
            pinned: chat.pinned,
        }
    })
}

async function getChats(req, res) {
    const user = req.user;
    const chats = await chatModel
        .find({ user: user._id })
        .sort({ pinned: -1, lastActivity: -1 })
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

async function renameChat(req, res) {
    const { chatId } = req.params;
    const { title } = req.body;
    const user = req.user;
    const chat = await chatModel.findOneAndUpdate(
        { _id: chatId, user: user._id },
        { title },
        { new: true }
    )
    if (!chat) {
        return res.status(404).json({ message: "Chat not found!" })
    }
    res.status(200).json({ message: "Chat renamed successfully!", chat })
}

async function pinChat(req, res) {
    const { chatId } = req.params;
    const user = req.user;
    const chat = await chatModel.findOne({ _id: chatId, user: user._id })
    if (!chat) {
        return res.status(404).json({ message: "Chat not found!" })
    }
    chat.pinned = !chat.pinned;
    await chat.save()
    res.status(200).json({ message: "Chat pin toggled!", chat })
}

module.exports = {
    createChat,
    getChats,
    getChatMessages,
    deleteChat,
    renameChat,
    pinChat
}