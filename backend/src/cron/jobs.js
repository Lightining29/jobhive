const cron = require('node-cron');
const logger = require('../config/logger');
const { fetchAllJobs, cleanupExpiredJobs } = require('../services/jobIngestion.service');

const startCronJobs = () => {
  // Fetch immediately on server start
  (async () => {
    logger.info('[cron] startup job fetch started');
    try {
      const results = await fetchAllJobs();
      logger.info('[cron] startup job fetch finished', results);
    } catch (err) {
      logger.error('[cron] startup job fetch error', { message: err.message });
    }
  })();

  // Fetch every 5 minutes for high-concurrency rapid updates (10,000+ users)
  cron.schedule('*/5 * * * *', async () => {
    logger.info('[cron] scheduled 5-minute job fetch started');
    try {
      const results = await fetchAllJobs();
      logger.info('[cron] scheduled 5-minute job fetch finished', results);
    } catch (err) {
      logger.error('[cron] scheduled job fetch error', { message: err.message });
    }
  });

  // Daily cleanup at 2:30 AM
  cron.schedule('30 2 * * *', async () => {
    logger.info('[cron] expired job cleanup started');
    try {
      const count = await cleanupExpiredJobs();
      logger.info(`[cron] expired cleanup finished: ${count}`);
    } catch (err) {
      logger.error('[cron] expired cleanup error', { message: err.message });
    }
  });

  logger.info('[cron] scheduled jobs registered (startup fetch + every 30 min + daily cleanup)');
};

module.exports = { startCronJobs };
