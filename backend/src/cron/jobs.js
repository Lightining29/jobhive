const cron = require('node-cron');
const logger = require('../config/logger');
const { fetchAllJobs, cleanupExpiredJobs } = require('../services/jobIngestion.service');

const startCronJobs = () => {
  // Only run periodic scraper if explicitly enabled via JOB_INGESTION_CRON=true
  if (process.env.JOB_INGESTION_CRON === 'true') {
    cron.schedule('0 */12 * * *', async () => {
      logger.info('[cron] scheduled 12-hour job fetch started');
      try {
        const results = await fetchAllJobs();
        logger.info('[cron] scheduled 12-hour job fetch finished', results);
      } catch (err) {
        logger.error('[cron] scheduled job fetch error', { message: err.message });
      }
    });
    logger.info('[cron] job ingestion cron registered (every 12 hours)');
  } else {
    logger.info('[cron] job ingestion cron is disabled to protect database storage quota');
  }

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
