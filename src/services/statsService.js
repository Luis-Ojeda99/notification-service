const db = require("../database/connection");

class StatsService {
  async getChannelStats() {
    const result = await db.query(`
      SELECT 
        channel,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
      FROM notifications
      GROUP BY channel
    `);
    return result.rows;
  }

  async getHourlyStats(hours = 24) {
    const result = await db.query(`
      SELECT 
        DATE_TRUNC('hour', created_at) as hour,
        COUNT(*) as count,
        status
      FROM notifications
      WHERE created_at >= NOW() - INTERVAL '${hours} hours'
      GROUP BY hour, status
      ORDER BY hour DESC
    `);
    return result.rows;
  }

  async getTopRecipients(limit = 10) {
    const result = await db.query(
      `
      SELECT 
        recipient,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered
      FROM notifications
      GROUP BY recipient
      ORDER BY total DESC
      LIMIT $1
    `,
      [limit]
    );
    return result.rows;
  }

  async getAverageProcessingTime() {
    const result = await db.query(`
      SELECT 
        channel,
        AVG(
          EXTRACT(EPOCH FROM (updated_at - created_at))
        ) as avg_seconds
      FROM notifications
      WHERE status = 'delivered'
      GROUP BY channel
    `);
    return result.rows;
  }
}

module.exports = new StatsService();
