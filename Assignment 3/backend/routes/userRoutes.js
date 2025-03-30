const express = require('express');
const userController = require('../controller/userController');
const adminMiddleware = require('../middleware/adminMiddleware');
const { authMiddleware } = require('../middleware/authMiddleware');
const logger = require('../middleware/logger');
const router = express.Router();

router.get('/get-all', adminMiddleware, (req, res, next) => {
  req.action = 'Get Users';
  next();
},logger, userController.getAllUsers);
router.get('/get-user/:id', adminMiddleware, userController.getUserById); // Ensure this route uses an ID parameter
router.put('/update-user/:id', adminMiddleware, (req, res, next) => {
  req.action = 'Update User';
  next();
},logger, userController.updateUser); // Ensure this route uses an ID parameter
router.post('/create-user', adminMiddleware, (req, res, next) => {
  req.action = 'Create User';
  next();
},logger, userController.createUser);
router.delete('/delete-user', adminMiddleware, (req, res, next) => {
  req.action = 'Delete User';
  next();
},logger,userController.deleteUser);

router.get('/get-usernames', authMiddleware, userController.getAllUsernames);

module.exports = router;
