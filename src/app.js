const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const httpStatus = require('http-status');
const morgan = require('morgan');
const config = require('./config/config');
const { authLimiter } = require('./middleware/rateLimiter');
const routes = require('./routes');
const { errorConverter, errorHandler } = require('./middleware/error');
const ApiError = require('./utils/ApiError');
const logger = require('./config/logger');

const app = express();

// Logging
if (config.env !== 'test') {
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
}

// Security middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xss());
app.use(mongoSanitize());
app.use(compression());
app.use(cors());
app.options('*', cors());
app.use(cookieParser());

// Rate limiting for auth routes in production
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// Middleware to clean URLs (remove trailing spaces and normalize)
app.use((req, res, next) => {
  // Remove trailing spaces and normalize the URL
  const originalUrl = req.url;
  const cleanUrl = req.url.trim().replace(/\/+$/, '') || '/';
  
  if (originalUrl !== cleanUrl) {
    console.log(`URL cleaned: "${originalUrl}" -> "${cleanUrl}"`);
    req.url = cleanUrl;
  }
  
  next();
});

// Add a simple health check endpoint for debugging
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.env 
  });
});

// API routes
app.use('/v1', routes);

// Remove this line if you want to use only the /v1/docs route
// app.use('/docs', require('./utils/swagger'));

// 404 handler
app.use((req, res, next) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// Error handling middleware
app.use(errorConverter);
app.use(errorHandler);

module.exports = app;