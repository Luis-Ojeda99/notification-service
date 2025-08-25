const db = require("../../database/connection");

class QueueManager {
  async enqueue(notificationId, priority = 0) {
    const result = await db.query(
      `
      INSERT INTO notification_queue (notification_id, priority, status, run_at)
      VALUES ($1, $2, 'pending', NOW())
      RETURNING *
    `,
      [notificationId, priority]
    );
    return result.rows[0];
  }

  async dequeue() {
    const result = await db.query(`
      UPDATE notification_queue
      SET status = 'processing', locked_until = NOW() + INTERVAL '5 minutes'
      WHERE id = (
        SELECT id FROM notification_queue
        WHERE status = 'pending' AND run_at <= NOW()
        ORDER BY priority DESC, created_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      RETURNING *
    `);
    return result.rows[0];
  }

  async markComplete(queueId) {
    await db.query(
      `
      UPDATE notification_queue
      SET status = 'completed'
      WHERE id = $1
    `,
      [queueId]
    );
  }

  async markFailed(queueId) {
    await db.query(
      `
      UPDATE notification_queue
      SET status = 'failed', attempts = attempts + 1
      WHERE id = $1
    `,
      [queueId]
    );
  }
}

module.exports = new QueueManager();