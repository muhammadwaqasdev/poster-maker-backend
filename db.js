const mongoose = require('mongoose');

var env = require('dotenv');
env.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.db_url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

module.exports = connectDB;