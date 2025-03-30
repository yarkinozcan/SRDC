const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config(); // Load environment variables

async function mongoDbConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("MongoDB successfully connected.");
  } catch (err) {
    console.error("Could not connect to database:", err);
  }
}
mongoDbConnection();

const userRoute = require('./routes/userRoutes'); // Adjust the path if necessary
const messageRoute = require('./routes/messageRoutes'); // Adjust the path if necessary
const authRoute = require('./routes/authRoutes'); // Adjust the path if necessary
const logRoutes = require('./routes/logRoutes'); // Include log routes
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'dist/mean-stack-crud-app')));
app.use('/', express.static(path.join(__dirname, 'dist/mean-stack-crud-app')));
app.use('/api', userRoute);
app.use('/api', messageRoute);
app.use('/api', authRoute);
app.use('/api', logRoutes); // Use log routes

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log('Connected to port ' + port);
});

app.use((req, res, next) => {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  console.error(err.message);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message);
});
