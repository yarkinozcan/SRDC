const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { currentOnlineUsers } = require('../middleware/authMiddleware');
const Log = require('../models/Log')
exports.register = async (req, res) => {
  try {
    console.log("Received registration data:", req.body);
    const { username, password, name, surname, email, address, birthdate, gender, admin } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      name,
      surname,
      email,
      address,
      birthdate,
      gender,
      admin
    });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ message: 'Error registering user', error });
  }
};


exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt:", { username, password });

    const user = await User.findOne({ username });
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: 'User not found' });
    }
    console.log("User found:", user);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid credentials");
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, username: user.username, name: user.name, admin: user.admin, surname: user.surname, address: user.address, gender: user.gender, email: user.email, birthdate: user.birthdate }, process.env.JWT_SECRET, { expiresIn: '1h' });
    currentOnlineUsers.add(token);

    // Log login action
    const logEntry = new Log({
      username: user.username,
      action: 'Login',
      requestTime: new Date(),
      ip: req.ip,
      browser: req.headers['user-agent'],
      endpoint: req.originalUrl,
      method: req.method
    });
    await logEntry.save();

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: 'Error logging in', error });
  }
};

exports.logout = async (req, res) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    currentOnlineUsers.delete(token);

    // Log logout action
    const logEntry = new Log({
      username: decoded.username,
      action: 'Logout',
      requestTime: new Date(),
      ip: req.ip,
      browser: req.headers['user-agent'],
      endpoint: req.originalUrl,
      method: req.method
    });
    await logEntry.save();

    res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      currentOnlineUsers.delete(token); // Remove the expired token
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};
