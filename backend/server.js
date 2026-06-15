require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Import Routes
const authRouter = require('./routes/authrouter');
const bookRouter = require('./routes/bookrouter');

// Use Routes
app.use('/api/auth', authRouter);
app.use('/api/books', bookRouter);

// Connect to MongoDB and Start Server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB!');
    app.listen(5000, () => {
      console.log('🚀 Server running on port 5000');
    });
  })
  .catch((error) => {
    console.log('❌ MongoDB connection error:', error.message);
  });