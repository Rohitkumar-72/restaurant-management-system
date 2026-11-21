const express = require('express');
const { getDatabaseStatus } = require('../config/database');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/health', (req, res) => {
  const database = getDatabaseStatus();
  const missingUri = !process.env.MONGODB_URI;
  const status = missingUri
    ? 'not_configured'
    : mongoose.connection.readyState === 1
      ? 'connected'
      : 'disconnected';

  res.status(200).json({
    success: true,
    service: 'Sapphire Vista API',
    database: { status },
  });
});

module.exports = router;
