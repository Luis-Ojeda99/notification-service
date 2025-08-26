const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const config = require("./config");
const logger = require("./utils/logger");

// Rate limiting
const { globalLimiter, apiLimiter } = require("./config/rateLimit");

// Route imports
const dashboardRoutes = require("./web/routes/dashboard");
const notificationRoutes = require("./api/v1/routes/notifications");

// Service imports
const healthService = require("./services/healthService");

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration 
const corsOptions = {
  origin: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Apply global rate limiter to all routes
app.use(globalLimiter);

// Body parsing middleware with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging - different format for production
if (config.app.env === 'production') {
  app.use(morgan('combined', { 
    stream: { write: message => logger.info(message.trim()) }
  }));
} else {
  app.use(morgan('dev'));
}

// View engine setup
app.set("views", path.join(__dirname, "web/views"));
app.set("view engine", "ejs");

// Static files (for CSS, JS, images)
app.use(express.static(path.join(__dirname, "../public")));

// Health check endpoint
app.get("/health", async (req, res, next) => {
  try {
    const health = await healthService.getSystemHealth();
    const statusCode = health.status === "unhealthy" ? 503 : 200;

    res.status(statusCode).json({
      ...health,
      service: config.app.name,
      version: config.app.version,
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: "Health check failed",
      timestamp: new Date().toISOString(),
    });
  }
});

// Ready check endpoint (checks dependencies)
app.get('/ready', async (req, res) => {
  try {
    const db = require('./database/connection');
    await db.query('SELECT 1');
    res.json({ 
      ready: true,
      service: config.app.name,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      ready: false,
      error: 'Database not ready',
      timestamp: new Date().toISOString()
    });
  }
});

// Monitoring endpoint with basic metrics
app.get('/metrics', async (req, res) => {
  try {
    const db = require('./database/connection');
    const notificationRepository = require('./database/repositories/notificationRepository');
    const stats = await notificationRepository.getStats();
    const dbCheck = await db.query('SELECT COUNT(*) FROM notifications');
    
    res.json({
      service: config.app.name,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      notifications: {
        total: parseInt(dbCheck.rows[0].count),
        ...stats
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

// Web routes (Dashboard) - uses global limiter only
app.use("/", dashboardRoutes);

// API routes with additional API rate limiting
app.use("/api/v1/notifications", apiLimiter, notificationRoutes);

// Root API endpoint with API rate limiting
app.get("/api/v1", apiLimiter, (req, res, next) => {
  try {
    res.json({
      message: "Notification Service API v1",
      endpoints: {
        notifications: "/api/v1/notifications",
        health: "/health",
      },
    });
  } catch (error) {
    next(error);
  }
});

// 404 handler
app.use((req, res, next) => {
  try {
    // Check if it's an API request or web request
    if (req.path.startsWith("/api")) {
      res.status(404).json({ error: "API endpoint not found" });
    } else {
      res.status(404).render("pages/404", {
        pageTitle: "404 - Page Not Found",
        path: req.path,
      });
    }
  } catch (error) {
    next(error);
  }
});

// Error handler
app.use((err, req, res, next) => {
  logger.error("Error:", err.stack);

  // Check if it's an API request or web request
  if (req.path.startsWith("/api")) {
    res.status(500).json({
      error: "Something went wrong!",
      message: config.app.env === "development" ? err.message : undefined,
    });
  } else {
    res.status(500).render("pages/error", {
      pageTitle: "Error",
      path: req.path,
      error: config.app.env === "development" ? err : null,
    });
  }
});

module.exports = app;