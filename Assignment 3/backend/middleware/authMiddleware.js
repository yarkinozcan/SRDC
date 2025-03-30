const jwt = require('jsonwebtoken');
const User = require('../models/User');

const currentOnlineUsers = new Set();

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.replace('Bearer ', '');
  if (!currentOnlineUsers.has(token)) {
    return res.status(401).json({ message: 'Access denied. Invalid token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(403).json({ message: 'User account has been deleted.' });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      currentOnlineUsers.delete(token); // Remove the expired token
      return res.status(401).json({ message: 'Session expired. Please log in again.', expired: true });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = { authMiddleware, currentOnlineUsers };
