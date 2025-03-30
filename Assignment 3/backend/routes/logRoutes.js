// routes/logRoutes.js
const express = require('express');
const router = express.Router();
const logController = require('../controller/logController');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/logs', adminMiddleware, logController.getLogs);

module.exports = router;
