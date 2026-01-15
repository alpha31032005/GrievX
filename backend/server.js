const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./src/config/env');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');
const logger = require('./src/utils/logger');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const complaintRoutes = require('./src/routes/complaintRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// Request logging
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Civic Issue Reporting & Analytics System',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      complaints: '/api/complaints',
      analytics: '/api/analytics',
      health: '/health',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  logger.info(`
    ╔════════════════════════════════════════════════════════════╗
    ║     Smart Civic Issue Reporting & Analytics System        ║
    ║                    🚀 SERVER STARTED 🚀                   ║
    ╠════════════════════════════════════════════════════════════╣
    ║ Server: Running on port ${PORT}
    ║ Environment: ${config.NODE_ENV}
    ║ Database: ${config.MONGODB_URI}
    ║ ML Service: ${config.ML_SERVICE_URL}
    ╠════════════════════════════════════════════════════════════╣
    ║ Available Endpoints:
    ║ • Auth:       http://localhost:${PORT}/api/auth
    ║ • Complaints: http://localhost:${PORT}/api/complaints
    ║ • Analytics:  http://localhost:${PORT}/api/analytics
    ║ • Health:     http://localhost:${PORT}/health
    ╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.warn('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    logger.info('HTTP server closed');
  });
});

module.exports = app;
