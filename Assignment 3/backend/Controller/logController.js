const Log = require('../models/Log');

exports.getLogs = async (req, res) => {
  try {
    const { filter = '', sort = 'desc', page = 1, limit = 10, action = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (filter) {
      query.username = { $regex: filter, $options: 'i' };
    }
    if (action) {
      query.action = action;
    }

    const logs = await Log.find(query)
      .sort({ requestTime: sort === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalLogs = await Log.countDocuments(query);

    res.status(200).json({ logs, totalLogs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs', error });
  }
};
