const connectDB = require('../src/config/db');
const Job = require('../src/models/Job');
const CompanyPortalsProvider = require('../src/services/providers/companyPortals.provider');

async function run() {
  await connectDB();
  console.log('Optimizing MongoDB storage quota...');

  // Backup recruiter jobs
  const recruiterJobs = await Job.find({ source: 'recruiter' }).lean();
  console.log(`Backed up ${recruiterJobs.length} recruiter jobs.`);

  // Prepare live company portal jobs
  const provider = new CompanyPortalsProvider();
  const livePortalJobs = await provider.fetch();
  console.log(`Prepared ${livePortalJobs.length} live company career portal jobs.`);

  // Drop collection to reclaim 585 MB disk storage
  try {
    await Job.collection.drop();
    console.log('Dropped old bloated collection. Disk space reclaimed!');
  } catch (e) {
    console.log('Note:', e.message);
  }

  // Re-create indexes
  await Job.createIndexes();

  // Insert live portal jobs + recruiter jobs
  const toInsert = [...livePortalJobs, ...recruiterJobs];
  if (toInsert.length > 0) {
    await Job.insertMany(toInsert, { ordered: false });
    console.log(`Inserted ${toInsert.length} curated jobs!`);
  }

  console.log('\n--- VERIFIED LIVE COMPANY PORTAL JOBS IN DATABASE ---');
  const inserted = await Job.find({}).select('jobTitle companyName location salary').lean();
  inserted.forEach((j, i) => {
    console.log(`${i + 1}. [${j.companyName}] ${j.jobTitle} - ${j.location} (₹${j.salary ? j.salary.toLocaleString() : 'Competitive'})`);
  });

  process.exit(0);
}

run().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
