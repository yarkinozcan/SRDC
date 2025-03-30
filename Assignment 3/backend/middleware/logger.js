const Log = require('../models/Log');

const logger = async (req, res, next) => {
  const logEntry = new Log({
    username: req.user ? req.user.username : 'Guest',
    action: req.action || 'Unknown', // Default to 'Unknown' if action not provided
    requestTime: new Date(),
    ip: req.ip,
    browser: req.headers['user-agent'],
    endpoint: req.originalUrl,
    method: req.method
  });

  await logEntry.save();
  next();
};

module.exports = logger;
