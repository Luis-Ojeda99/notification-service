const db = require("../database/connection");
const notificationRepository = require("../database/repositories/notificationRepository");

class RetryWorker {
  constructor() {
    this.isRunning = false;
  }

  async start() {
    this.isRunning = true;
    console.log("🔄 Retry worker started");

    while (this.isRunning) {
      try {
        // Find failed notifications that should be retried
        const result = await db.query(`
          SELECT nq.*, n.attempts, n.max_attempts 
          FROM notification_queue nq
          JOIN notifications n ON n.id = nq.notification_id
          WHERE nq.status = 'failed' 
          AND n.attempts < n.max_attempts
          AND nq.created_at < NOW() - INTERVAL '1 minute'
          LIMIT 10
        `);

        for (const job of result.rows) {
          console.log(
            `Retrying notification ${job.notification_id} (attempt ${
              job.attempts + 1
            })`
          );

          // Reset to pending for reprocessing
          await db.query(
            `
            UPDATE notification_queue 
            SET status = 'pending', run_at = NOW() 
            WHERE id = $1
          `,
            [job.id]
          );

          // Increment attempt counter
          await notificationRepository.update(job.notification_id, {
            attempts: job.attempts + 1,
          });
        }

        // Wait 30 seconds before next check
        await this.sleep(30000);
      } catch (error) {
        console.error("Retry worker error:", error);
        await this.sleep(30000);
      }
    }
  }

  async stop() {
    this.isRunning = false;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = RetryWorker;