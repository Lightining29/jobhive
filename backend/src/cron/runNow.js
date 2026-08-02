require('dotenv').config();
const connectDB = require('../config/db');
const { fetchAllJobs } = require('../services/jobIngestion.service');

(async () => {
  try {
    await connectDB();
    console.log('Fetching jobs from all enabled providers...');
    const results = await fetchAllJobs();
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Fetch failed:', err.message);
    process.exit(1);
  }
})();
