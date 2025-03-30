const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  attachment: { type: String },
  timestamp: { type: Date, default: Date.now },
  deletedBySender: { type: Boolean, default: false },
  deletedByReceiver: { type: Boolean, default: false }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
