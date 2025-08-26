const db = require("../database/connection");

class HealthService {
  async checkDatabase() {
    try {
      await db.query("SELECT 1");
      return { status: "healthy", database: true };
    } catch (error) {
      return { status: "unhealthy", database: false, error: error.message };
    }
  }

  async checkQueue() {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          COUNT(*) FILTER (WHERE status = 'processing') as processing,
          COUNT(*) FILTER (WHERE status = 'failed' AND created_at > NOW() - INTERVAL '1 hour') as recent_failures
        FROM notification_queue
      `);

      const stats = result.rows[0];
      const isHealthy = stats.recent_failures < 100 && stats.pending < 1000;

      return {
        status: isHealthy ? "healthy" : "degraded",
        queue: {
          pending: parseInt(stats.pending),
          processing: parseInt(stats.processing),
          recentFailures: parseInt(stats.recent_failures),
        },
      };
    } catch (error) {
      return { status: "unhealthy", queue: null, error: error.message };
    }
  }

  async getSystemHealth() {
    const dbHealth = await this.checkDatabase();
    const queueHealth = await this.checkQueue();

    const overallStatus =
      dbHealth.status === "unhealthy" || queueHealth.status === "unhealthy"
        ? "unhealthy"
        : queueHealth.status === "degraded"
        ? "degraded"
        : "healthy";

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        queue: queueHealth,
      },
    };
  }
}

module.exports = new HealthService();
