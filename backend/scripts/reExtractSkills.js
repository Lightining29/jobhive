const connectDB = require('../src/config/db');
const Job = require('../src/models/Job');
const { extractSkills } = require('../src/utils/skillExtractor');
const { classifyJob } = require('../src/utils/jobClassifier');

async function run() {
  await connectDB();
  console.log('Starting lightning-fast skill cleanup & re-extraction...');

  const cursor = Job.find({})
    .select('jobTitle headline requiredSkills category subCategory')
    .lean()
    .cursor({ batchSize: 500 });

  let batch = [];
  let totalProcessed = 0;
  let totalUpdated = 0;

  for await (const job of cursor) {
    totalProcessed++;
    const { category, subCategory } = classifyJob(job.jobTitle, '');
    const cleanedSkills = extractSkills(job.jobTitle, '', job.requiredSkills || [], category);

    batch.push({
      updateOne: {
        filter: { _id: job._id },
        update: {
          $set: {
            requiredSkills: cleanedSkills,
            category,
            ...(subCategory && !job.subCategory ? { subCategory } : {}),
          },
        },
      },
    });

    if (batch.length >= 400) {
      const res = await Job.bulkWrite(batch, { ordered: false });
      totalUpdated += res.modifiedCount || 0;
      batch = [];
      console.log(`Processed ${totalProcessed} jobs (updated ${totalUpdated})...`);
    }
  }

  if (batch.length > 0) {
    const res = await Job.bulkWrite(batch, { ordered: false });
    totalUpdated += res.modifiedCount || 0;
  }

  console.log(`\nSkill re-extraction finished successfully! Total processed: ${totalProcessed}, Total updated: ${totalUpdated}`);
  process.exit(0);
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
