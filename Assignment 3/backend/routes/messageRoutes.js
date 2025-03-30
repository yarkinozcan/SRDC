const express = require('express');
const messageController = require('../controller/messageController');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();
const logger = require('../middleware/logger');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Add this line to import the 'fs' module

router.get('/inbox', authMiddleware, (req, res, next) => {
  req.action = 'Get Inbox';
  next();
}, logger, messageController.getInbox);

router.get('/outbox', authMiddleware, (req, res, next) => {
  req.action = 'Get Outbox';
  next();
}, logger, messageController.getOutbox);
router.delete('/delete/:messageId', authMiddleware, (req, res, next) => {
  req.action = 'Delete Message';
  next();
}, logger, messageController.deleteMessage);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
router.post('/send', authMiddleware, upload.single('attachment'), (req, res, next) => {
  req.action = 'Send Message';
  next();
}, logger,messageController.sendMessage);
router.get('/download/:filename', authMiddleware, messageController.downloadAttachment);

module.exports = router;
