const cron = require('node-cron');
const logger = require('../config/logger');
const { fetchAllJobs, cleanupExpiredJobs } = require('../services/jobIngestion.service');

let isFetching = false;

const runJobFetch = async (source = 'cron') => {
  if (isFetching) {
    logger.debug(`[cron] job fetch already in progress, skipping ${source} trigger`);
    return;
  }
  isFetching = true;
  logger.info(`[cron] 20-minute automated job fetch started (${source})`);
  try {
    const results = await fetchAllJobs();
    logger.info(`[cron] 20-minute automated job fetch finished (${source})`, results);
  } catch (err) {
    logger.error(`[cron] automated job fetch error (${source})`, { message: err.message });
  } finally {
    isFetching = false;
  }
};

const startCronJobs = () => {
  // Automatically fetch new jobs every 20 minutes
  cron.schedule('*/20 * * * *', async () => {
    await runJobFetch('20-minute-interval');
  });
  logger.info('[cron] automated job ingestion registered: every 20 minutes (*/20 * * * *)');

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

  logger.info('[cron] scheduled jobs active: 5-minute auto-fetch + daily cleanup');
};

module.exports = { startCronJobs, runJobFetch };

