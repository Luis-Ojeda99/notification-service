const app = require("./src/app");
const config = require("./src/config");
const logger = require("./src/utils/logger");
const db = require("./src/database/connection");

async function startServer() {
  try {
    // Test database connection
    await db.query("SELECT NOW()");
    logger.info("✅ Database connected");

    // Start server
    const server = app.listen(config.app.port, () => {
      logger.info(
        `🚀 ${config.app.name} is running on port ${config.app.port}`
      );
      logger.info(
        `📍 Health check: http://localhost:${config.app.port}/health`
      );
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received, shutting down gracefully...");
      server.close(() => {
        logger.info("Server closed");
        db.pool.end(() => {
          logger.info("Database connections closed");
          process.exit(0);
        });
      });
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();