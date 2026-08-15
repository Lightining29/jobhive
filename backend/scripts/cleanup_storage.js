const connectDB = require('../src/config/db');
const mongoose = require('mongoose');

async function clean() {
  await connectDB();
  const db = mongoose.connection.db;

  const appJobIds = (await db.collection('applications').find({}, { projection: { job: 1 } }).toArray()).map(a => a.job);
  const users = await db.collection('users').find({}, { projection: { savedJobs: 1 } }).toArray();
  const savedIds = users.flatMap(u => u.savedJobs || []);
  const protectedIds = [...new Set([...appJobIds, ...savedIds])].filter(Boolean);
  console.log('Protected jobs count:', protectedIds.length);

  const totalJobs = await db.collection('jobs').countDocuments();
  console.log('Total jobs before:', totalJobs);

  const keepRecent = await db.collection('jobs').find({}, { projection: { _id: 1 } }).sort({ createdAt: -1, _id: -1 }).limit(1500).toArray();
  const keepIds = new Set([...keepRecent.map(j => j._id.toString()), ...protectedIds.map(id => id.toString())]);
  console.log('Keeping jobs count:', keepIds.size);

  const keepObjectIdList = Array.from(keepIds).map(id => new mongoose.Types.ObjectId(id));
  const res = await db.collection('jobs').deleteMany({ _id: { $nin: keepObjectIdList } });
  console.log('Deleted old jobs:', res.deletedCount);

  const totalJobsAfter = await db.collection('jobs').countDocuments();
  console.log('Total jobs after:', totalJobsAfter);

  await db.collection('joblogs').deleteMany({});
  console.log('Cleaned joblogs');

  process.exit(0);
}

clean().catch(err => {
  console.error('Cleanup error:', err);
  process.exit(1);
});
