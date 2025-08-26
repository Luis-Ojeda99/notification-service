const app = require("./src/app");
const config = require("./src/config");
const logger = require("./src/utils/logger");
const db = require("./src/database/connection");

let server;

async function startServer() {
  try {
    await db.query("SELECT NOW()");
    logger.info("✅ Database connected");

    server = app.listen(config.app.port, () => {
      logger.info(`🚀 ${config.app.name} is running on port ${config.app.port}`);
      logger.info(`📍 Health check: http://localhost:${config.app.port}/health`);
    });

  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

function gracefulShutdown(signal) {
  logger.info(`${signal} received, starting graceful shutdown...`);
  
  server.close(() => {
    logger.info("HTTP server closed");
    
    db.pool.end(() => {
      logger.info("Database connections closed");
      process.exit(0);
    });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

startServer();