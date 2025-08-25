const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const config = require('./config');
const logger = require('./utils/logger');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev'));

// View engine setup (using regular EJS with includes)
app.set('views', path.join(__dirname, 'web/views'));
app.set('view engine', 'ejs');

// Static files (for CSS, JS, images)
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint 
app.get('/health', (req, res, next) => {
  try {
    res.json({ 
      status: 'healthy',
      service: config.app.name,
      version: config.app.version,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Web routes (Dashboard)
app.use('/', require('./web/routes/dashboard'));

// 404 handler 
app.use((req, res, next) => {
  try {
    // Check if it's an API request or web request
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'API endpoint not found' });
    } else {
      res.status(404).render('pages/404', {
        pageTitle: '404 - Page Not Found',
        path: req.path
      });
    }
  } catch (error) {
    next(error);
  }
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Error:', err.stack);
  
  // Check if it's an API request or web request
  if (req.path.startsWith('/api')) {
    res.status(500).json({ 
      error: 'Something went wrong!',
      message: config.app.env === 'development' ? err.message : undefined
    });
  } else {
    res.status(500).render('pages/error', {
      pageTitle: 'Error',
      path: req.path,
      error: config.app.env === 'development' ? err : null
    });
  }
});

module.exports = app;