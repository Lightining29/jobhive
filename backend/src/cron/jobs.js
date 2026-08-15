const cron = require('node-cron');
const logger = require('../config/logger');
const { fetchAllJobs, cleanupExpiredJobs } = require('../services/jobIngestion.service');

const startCronJobs = () => {
  // Fetch immediately on server start
  (async () => {
    logger.info('[cron] startup job fetch started');
    try {
      const Job = require('../models/Job');
      const nonTechRegex = /\b(marketing|marketer|translator|translation|interpreter|localization|linguist|language specialist|business executive|business development|account executive|sales executive|sales representative|sales rep|sales manager|client executive|executive assistant|operations executive|relationship manager|bdr|sdr|bde|recruiter|recruitment|talent acquisition|human resource|hr executive|hr manager|people operations|sourcer|copywriter|content writer|content creator|journalist|editor|accountant|accounting|financial analyst|auditor|tax specialist|bookkeeper|legal counsel|paralegal|lawyer|customer support|customer service|customer success|call center|telecaller|office assistant|receptionist|store manager|retail associate|nursing|nurse|physician|chef|cook|driver)\b/i;
      await Job.updateMany(
        { jobTitle: { $regex: nonTechRegex }, category: { $ne: 'non-technical' } },
        { $set: { category: 'non-technical' } }
      );
      await Job.updateMany(
        { $or: [{ headline: { $exists: false } }, { headline: '' }, { headline: null }] },
        [{ $set: { headline: '$jobTitle' } }]
      );
      const results = await fetchAllJobs();
      logger.info('[cron] startup job fetch finished', results);
    } catch (err) {
      logger.error('[cron] startup job fetch error', { message: err.message });
    }
  })();

  // Fetch once every 12 hours to maintain fresh jobs without overflowing database quota
  cron.schedule('0 */12 * * *', async () => {
    logger.info('[cron] scheduled 12-hour job fetch started');
    try {
      const results = await fetchAllJobs();
      logger.info('[cron] scheduled 12-hour job fetch finished', results);
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
