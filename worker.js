const NotificationWorker = require('./src/workers/notificationWorker');
const RetryWorker = require('./src/workers/retryWorker');
const logger = require('./src/utils/logger');
const db = require('./src/database/connection');

async function startWorker() {
  try {
    // Test database connection
    await db.query('SELECT NOW()');
    logger.info('✅ Worker database connected');
    
    // Create and start worker
    const worker = new NotificationWorker();
    await worker.start();
    
    // Handle shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, stopping worker...');
      await worker.stop();
      await db.pool.end();
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      logger.info('SIGINT received, stopping worker...');
      await worker.stop();
      await db.pool.end();
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('Failed to start worker:', error);
    process.exit(1);
  }
}

startWorker();