const db = require("../connection");

class NotificationRepository {
  // Get all notifications
  async findAll(limit = 50, offset = 0) {
    const result = await db.query(
      "SELECT * FROM notifications ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    return result.rows;
  }

  // Get single notification by ID
  async findById(id) {
    const result = await db.query("SELECT * FROM notifications WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  }

  // Create new notification
  async create(data) {
    const { recipient, channel, subject, content, metadata } = data;
    const result = await db.query(
      `
      INSERT INTO notifications (recipient, channel, subject, content, data, status)
      VALUES ($1, $2, $3, $4, $5, 'pending')
      RETURNING *
    `,
      [recipient, channel, subject, content, JSON.stringify(metadata || {})]
    );
    return result.rows[0];
  }

  // Update notification status
  async updateStatus(id, status) {
    const result = await db.query(
      "UPDATE notifications SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [status, id]
    );
    return result.rows[0];
  }

  // Delete notification
  async delete(id) {
    const result = await db.query(
      "DELETE FROM notifications WHERE id = $1 RETURNING id",
      [id]
    );
    return result.rows[0];
  }

  // Get statistics
  async getStats() {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
      FROM notifications
    `);
    return result.rows[0];
  }

  // Find by recipient
  async findByRecipient(recipient) {
    const result = await db.query(
      "SELECT * FROM notifications WHERE recipient = $1 ORDER BY created_at DESC",
      [recipient]
    );
    return result.rows;
  }

  // Find by status
  async findByStatus(status) {
    const result = await db.query(
      "SELECT * FROM notifications WHERE status = $1 ORDER BY created_at DESC",
      [status]
    );
    return result.rows;
  }

  // Update notification
  async update(id, data) {
    const { subject, content, status, attempts } = data;
    const result = await db.query(
      `
    UPDATE notifications 
    SET subject = $1, content = $2, status = $3, attempts = $4, updated_at = NOW()
    WHERE id = $5
    RETURNING *
  `,
      [subject, content, status, attempts, id]
    );
    return result.rows[0];
  }

  // Get recent notifications for dashboard
  async getRecent(limit = 10) {
    const result = await db.query(
      `
      SELECT id, recipient, channel, subject, status, created_at 
      FROM notifications 
      ORDER BY created_at DESC 
      LIMIT $1
    `,
      [limit]
    );
    return result.rows;
  }

  // Count notifications by status for a specific recipient
  async countByRecipientAndStatus(recipient, status) {
    const result = await db.query(
      "SELECT COUNT(*) FROM notifications WHERE recipient = $1 AND status = $2",
      [recipient, status]
    );
    return parseInt(result.rows[0].count);
  }
}

module.exports = new NotificationRepository();
