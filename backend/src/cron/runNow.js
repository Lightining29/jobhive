const { initDatabases } = require('../config/database');
const { fetchAllJobs } = require('../services/jobIngestion.service');

(async () => {
  try {
    await initDatabases();
    console.log('Fetching jobs from all enabled providers...');
    const results = await fetchAllJobs();
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Fetch failed:', err.message);
    process.exit(1);
  }
})();
