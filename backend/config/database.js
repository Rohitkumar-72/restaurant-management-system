const mongoose = require('mongoose');

const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    return {
      status: 'not_configured',
      message: 'MongoDB URI is not configured',
    };
  }

  try {
    await mongoose.connect(uri);
    return {
      status: 'connected',
      message: 'MongoDB connected',
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'MongoDB connection failed',
    };
  }
};

const getDatabaseStatus = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return {
    status: states[mongoose.connection.readyState] || 'unknown',
  };
};

module.exports = {
  connectDatabase,
  getDatabaseStatus,
};