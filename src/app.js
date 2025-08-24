const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const config = require("./config");
const logger = require("./utils/logger");

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan("dev"));

// View engine setup
app.set("views", path.join(__dirname, "web/views"));
app.set("view engine", "ejs");

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: config.app.name,
    version: config.app.version,
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Notification Service API",
    version: config.app.version,
    endpoints: {
      health: "/health",
      api: "/api/v1",
    },
  });
});

// TODO API Routes
// app.use('/api/v1/notifications', require('./api/v1/routes/notifications'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

module.exports = app;