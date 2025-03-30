const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema
let Log = new Schema({
  username: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  requestTime: {
    type: Date,
    default: Date.now,
    required: true,
  },
  ip: {
    type: String,
    required: true,
  },
  browser: {
    type: String,
    required: true,
  },
  endpoint: {
    type: String,
    required: true,
  },
  method: {
    type: String,
    required: true,
  }
}, {
  collection: 'logs',
  timestamps: true // Automatically add createdAt and updatedAt
});

module.exports = mongoose.model('Log', Log);
