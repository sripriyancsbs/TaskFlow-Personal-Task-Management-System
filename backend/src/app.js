const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

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

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'TaskFlow REST API',
    timestamp: new Date().toISOString(),
  });
});

// Task Management Routes
app.use('/api/tasks', taskRoutes);

// Catch-all 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
