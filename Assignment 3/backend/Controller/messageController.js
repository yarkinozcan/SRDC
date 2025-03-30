const fs = require('fs');
const Message = require('../models/Message');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

exports.sendMessage = async (req, res) => {
  try {
    const { sender, receiver, title, body } = req.body;
    const messageData = { sender, receiver, title, body };

    // Check if the receiver exists
    const receiverExists = await User.findOne({ username: receiver });
    if (!receiverExists) {
      return res.status(404).json({ message: 'Receiver does not exist' });
    }

    if (req.file) {
      messageData.attachment = req.file.filename;
    }

    const message = new Message(messageData);
    await message.save();
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message', error });
  }
};



exports.downloadAttachment = (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(__dirname, '..', 'uploads', fileName);
  res.download(filePath, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      res.status(500).json({ message: 'Error downloading file', error: err });
    }
  });
};

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { username } = req.user;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender === username) {
      message.deletedBySender = true;
    }

    if (message.receiver === username) {
      message.deletedByReceiver = true;
    }

    await message.save();

    // If both sender and receiver have deleted the message, remove it from the database
    if (message.deletedBySender && message.deletedByReceiver) {
      await Message.findByIdAndDelete(messageId);
    }

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Error deleting message', error });
  }
};

exports.getInbox = async (req, res) => {
  try {
    const filter = req.query.filter ? req.query.filter.toLowerCase() : '';
    const sort = req.query.sort === 'asc' ? 1 : -1;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { receiver: req.user.username, deletedByReceiver: false };
    if (filter) {
      query.$or = [
        { title: { $regex: filter, $options: 'i' } },
        { body: { $regex: filter, $options: 'i' } },
        { sender: { $regex: filter, $options: 'i' } }
      ];
    }

    const totalMessages = await Message.countDocuments(query);
    const messages = await Message.find(query)
      .sort({ timestamp: sort })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      total: totalMessages,
      page,
      pages: Math.ceil(totalMessages / limit),
      data: messages
    });
  } catch (error) {
    console.error('Error fetching inbox messages:', error);
    res.status(500).json({ message: 'Error fetching inbox messages', error });
  }
};

exports.getOutbox = async (req, res) => {
  try {
    const filter = req.query.filter ? req.query.filter.toLowerCase() : '';
    const sort = req.query.sort === 'asc' ? 1 : -1;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { sender: req.user.username, deletedBySender: false };
    if (filter) {
      query.$or = [
        { title: { $regex: filter, $options: 'i' } },
        { body: { $regex: filter, $options: 'i' } },
        { receiver: { $regex: filter, $options: 'i' } }
      ];
    }

    const totalMessages = await Message.countDocuments(query);
    const messages = await Message.find(query)
      .sort({ timestamp: sort })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      total: totalMessages,
      page,
      pages: Math.ceil(totalMessages / limit),
      data: messages
    });
  } catch (error) {
    console.error('Error fetching outbox messages:', error);
    res.status(500).json({ message: 'Error fetching outbox messages', error });
  }
};
