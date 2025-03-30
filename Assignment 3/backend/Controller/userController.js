const User = require('../models/User');
const Message = require('../models/Message');
const bcrypt = require('bcrypt');

// Get all users with filtering and pagination
exports.getAllUsers = async (req, res) => {
  try {
    const filter = req.query.filter ? req.query.filter.toLowerCase() : '';
    const admin = req.query.admin;
    const gender = req.query.gender;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    if (filter) {
      query = {
        $or: [
          { username: { $regex: filter, $options: 'i' } },
          { name: { $regex: filter, $options: 'i' } },
          { surname: { $regex: filter, $options: 'i' } },
          { email: { $regex: filter, $options: 'i' } }
        ]
      };
    }

    if (admin !== '') {
      query.admin = admin === 'true';
    }

    if (gender) {
      query.gender = gender;
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query).select('-password').skip(skip).limit(limit);

    res.status(200).json({
      total: totalUsers,
      page,
      pages: Math.ceil(totalUsers / limit),
      data: users
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error getting user', error });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User updated successfully', updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { username } = req.body;

    // Find and delete the user
    const deletedUser = await User.findOneAndDelete({ username });
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update messages where the deleted user was the sender or receiver
    await Message.updateMany({ sender: username }, { $set: { sender: null } });
    await Message.updateMany({ receiver: username }, { $set: { receiver: null } });

    res.status(200).json({ message: 'User deleted and messages updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};

// Create user (Admins only)
exports.createUser = async (req, res) => {
  try {
    const { username, password, name, surname, email, address, gender, birthdate, admin } = req.body;

    // Check if the username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or Email is already in use.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      password: hashedPassword,
      name,
      surname,
      email,
      address,
      gender,
      birthdate,
      admin
    });


    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'User created successfully', newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

// Get all usernames (accessible by all users)
exports.getAllUsernames = async (req, res) => {
  try {
    const users = await User.find().select('username -_id'); // Only select the username field
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching usernames', error });
  }
};


