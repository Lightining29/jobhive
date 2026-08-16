const connectDB = require('../src/config/db');
const Job = require('../src/models/Job');

async function prune() {
  await connectDB();
  console.log('Checking database storage and pruning older external jobs...');

  const total = await Job.countDocuments({});
  console.log(`Current total jobs: ${total}`);

  // Keep all recruiter jobs, and keep the latest 2,500 active high-quality jobs
  const keepJobs = await Job.find({ source: { $ne: 'recruiter' } })
    .sort({ postedDate: -1, trendingScore: -1 })
    .limit(2500)
    .select('_id')
    .lean();

  const keepIds = new Set(keepJobs.map((j) => j._id.toString()));

  const deleteFilter = {
    source: { $ne: 'recruiter' },
    _id: { $nin: Array.from(keepIds) },
  };

  const deleteResult = await Job.deleteMany(deleteFilter);
  console.log(`Deleted ${deleteResult.deletedCount} old excess jobs to free MongoDB space quota.`);

  const remaining = await Job.countDocuments({});
  console.log(`Remaining high-quality jobs: ${remaining}`);
  process.exit(0);
}

prune().catch((err) => {
  console.error('Prune failed:', err);
  process.exit(1);
});
