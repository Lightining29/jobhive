const connectDB = require('../src/config/db');
const Job = require('../src/models/Job');

async function test() {
  await connectDB();
  const delhiNcrJobs = await Job.find({
    location: { $regex: /Delhi|Noida|Gurugram|Gurgaon/i },
  })
    .select('companyName jobTitle location salary requiredSkills')
    .lean();

  console.log(`\n=== DELHI NCR (DELHI / NOIDA / GURUGRAM) LIVE JOBS: ${delhiNcrJobs.length} ===`);
  delhiNcrJobs.forEach((j, i) => {
    console.log(`${i + 1}. [${j.companyName}] ${j.jobTitle} (${j.location}) -> Skills: ${(j.requiredSkills || []).join(', ')}`);
  });

  const total = await Job.countDocuments({});
  console.log(`\nTotal Active Jobs in Database: ${total}`);
  process.exit(0);
}

test();
