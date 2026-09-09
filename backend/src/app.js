const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { checkDbConnection } = require('./config/db');

const app = express();

// CORS configuration
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching origin
      if (!origin || origin === allowedOrigin || allowedOrigin === '*') {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in development for flexibility
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser
app.use(express.json());

// API Health Check with live Database verification
app.get('/api/health', async (req, res) => {
  const dbHealth = await checkDbConnection();
  const isOk = dbHealth.connected;

  res.status(isOk ? 200 : 503).json({
    status: isOk ? 'ok' : 'degraded',
    service: 'TaskFlow REST API',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    database: dbHealth,
  });
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// Task Management Routes (Protected)
app.use('/api/tasks', taskRoutes);

// Catch-all 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
