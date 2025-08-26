const NotificationWorker = require('./src/workers/notificationWorker');
const RetryWorker = require('./src/workers/retryWorker');
const logger = require('./src/utils/logger');
const db = require('./src/database/connection');

async function startWorker() {
  try {
    // Test database connection
    await db.query('SELECT NOW()');
    logger.info('✅ Worker database connected');
    
    // Create workers
    const notificationWorker = new NotificationWorker();
    const retryWorker = new RetryWorker();
    
    // Start both workers
    await Promise.all([
      notificationWorker.start(),
      retryWorker.start()
    ]);
    
    // Handle shutdown
    const shutdown = async () => {
      logger.info('Shutting down workers...');
      await notificationWorker.stop();
      await retryWorker.stop();
      await db.pool.end();
      process.exit(0);
    };
    
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
  } catch (error) {
    logger.error('Failed to start worker:', error);
    process.exit(1);
  }
}

startWorker();