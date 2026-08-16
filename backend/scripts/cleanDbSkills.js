const connectDB = require('../src/config/db');
const Job = require('../src/models/Job');
const { extractSkills } = require('../src/utils/skillExtractor');
const { classifyJob } = require('../src/utils/jobClassifier');

async function cleanSkills() {
  await connectDB();
  console.log('Fetching all jobs with only title and requiredSkills...');
  const total = await Job.countDocuments({});
  console.log(`Total jobs in collection: ${total}`);

  const batchSize = 100;
  let processed = 0;

  for (let skip = 0; skip < total; skip += batchSize) {
    const batch = await Job.find({}, { _id: 1, jobTitle: 1, description: 1, requiredSkills: 1 })
      .skip(skip)
      .limit(batchSize)
      .lean();

    const ops = batch.map((job) => {
      const { category, subCategory } = classifyJob(job.jobTitle, job.description || '');
      const newSkills = extractSkills(job.jobTitle, job.description || '', job.requiredSkills || [], category);
      return {
        updateOne: {
          filter: { _id: job._id },
          update: {
            $set: {
              category,
              subCategory,
              requiredSkills: newSkills,
            },
          },
        },
      };
    });

    if (ops.length > 0) {
      await Job.bulkWrite(ops);
    }
    processed += batch.length;
    console.log(`Sanitized ${processed}/${total} jobs...`);
  }

  console.log('✅ All jobs successfully sanitized with clean, valid canonical skills!');
  process.exit(0);
}

cleanSkills().catch((err) => {
  console.error(err);
  process.exit(1);
});
