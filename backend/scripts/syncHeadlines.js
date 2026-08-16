const connectDB = require('../src/config/db');
const Job = require('../src/models/Job');

async function sync() {
  await connectDB();
  console.log('Ensuring all jobs have complete headlines matching their title & company...');

  const cursor = Job.find({}).cursor();
  let updated = 0;

  for await (const j of cursor) {
    const expectedHeadline = `${j.jobTitle} at ${j.companyName || 'Company'}`;
    if (!j.headline || j.headline !== expectedHeadline) {
      j.headline = expectedHeadline;
      await j.save();
      updated++;
    }
  }

  console.log(`Synced headlines across all jobs! Updated: ${updated}`);
  process.exit(0);
}

sync().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
