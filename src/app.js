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
app.use(cors());

// Apply global rate limiter to all routes
app.use(globalLimiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan("dev"));

// View engine setup
app.set("views", path.join(__dirname, "web/views"));
app.set("view engine", "ejs");

// Static files (for CSS, JS, images)
app.use(express.static(path.join(__dirname, "../public")));

// Health check endpoint (no extra rate limiting for health checks)
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

// Web routes (Dashboard)
app.use("/", dashboardRoutes);

// API routes 
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