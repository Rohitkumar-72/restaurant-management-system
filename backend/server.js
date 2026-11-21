const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDatabase } = require('./config/database');
const healthRoutes = require('./routes/healthRoutes');
const foodRoutes = require('./routes/foodRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', healthRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/categories', categoryRoutes);

app.use(errorMiddleware);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

const startServer = async () => {
  let databaseStatus;

  try {
    databaseStatus = await connectDatabase();
  } catch (error) {
    databaseStatus = {
      status: 'error',
      message: 'MongoDB connection failed',
    };
  }

  app.listen(port, () => {
    console.log(`Sapphire Vista API listening on http://localhost:${port}`);
    console.log(`Database status: ${databaseStatus.status}`);
  });
};

startServer();