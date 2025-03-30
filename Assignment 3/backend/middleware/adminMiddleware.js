const { authMiddleware, currentOnlineUsers } = require('./authMiddleware');

const adminMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.replace('Bearer ', '');

  if (!token || !currentOnlineUsers.has(token)) {
    return res.status(401).json({ message: 'Access denied. Invalid token.' });
  }

  authMiddleware(req, res, () => {
    if (!req.user.admin) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
  });
};

module.exports = adminMiddleware;
