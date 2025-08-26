const db = require("../database/connection");
const logger = require("../utils/logger");

class CleanupWorker {
  constructor() {
    this.isRunning = false;
    this.retentionDays = 30; // Keep notifications for 30 days
  }

  async start() {
    this.isRunning = true;
    logger.info("🧹 Cleanup worker started");

    while (this.isRunning) {
      try {
        await this.cleanupOldNotifications();
        await this.cleanupOldQueueItems();

        // Run cleanup once per hour
        await this.sleep(3600000);
      } catch (error) {
        logger.error("Cleanup worker error:", error);
        await this.sleep(3600000);
      }
    }
  }

  async cleanupOldNotifications() {
    const result = await db.query(`
      DELETE FROM notifications 
      WHERE created_at < NOW() - INTERVAL '${this.retentionDays} days'
      AND status IN ('delivered', 'failed')
      RETURNING id
    `);

    if (result.rows.length > 0) {
      logger.info(`Cleaned up ${result.rows.length} old notifications`);
    }
  }

  async cleanupOldQueueItems() {
    const result = await db.query(`
      DELETE FROM notification_queue 
      WHERE created_at < NOW() - INTERVAL '7 days'
      AND status IN ('completed', 'failed')
      RETURNING id
    `);

    if (result.rows.length > 0) {
      logger.info(`Cleaned up ${result.rows.length} old queue items`);
    }
  }

  async stop() {
    this.isRunning = false;
    logger.info("🧹 Cleanup worker stopped");
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = CleanupWorker;