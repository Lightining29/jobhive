const connectDB = require('../src/config/db');
const mongoose = require('mongoose');

async function dropAndClean() {
  await connectDB();
  const db = mongoose.connection.db;

  console.log('Fetching 200 recent clean jobs (without raw field)...');
  const cleanJobs = await db.collection('jobs').find({}, { projection: { raw: 0 } }).sort({ _id: -1 }).limit(300).toArray();
  console.log(`Retrieved ${cleanJobs.length} clean jobs.`);

  console.log('Dropping collection...');
  try {
    await db.collection('jobs').drop();
    console.log('Jobs collection dropped.');
  } catch (e) {
    console.log('Drop error (ignored if already dropped):', e.message);
  }

  // Also clean joblogs if any
  try {
    await db.collection('joblogs').drop();
  } catch (e) {}

  console.log('Reinserting clean jobs...');
  if (cleanJobs.length > 0) {
    await db.collection('jobs').insertMany(cleanJobs);
    console.log(`Inserted ${cleanJobs.length} jobs.`);
  }

  // Re-create indexes
  await db.collection('jobs').createIndex({ slug: 1 }, { unique: true, sparse: true });
  await db.collection('jobs').createIndex({ category: 1 });
  await db.collection('jobs').createIndex({ workMode: 1 });
  await db.collection('jobs').createIndex({ employmentType: 1 });
  await db.collection('jobs').createIndex({ experienceLevel: 1 });
  await db.collection('jobs').createIndex({ createdAt: -1 });
  console.log('Indexes recreated.');

  // Test insert user
  const testUser = await db.collection('users').insertOne({
    name: 'Atlas Write Test',
    email: 'atlas_test_' + Date.now() + '@test.com',
    createdAt: new Date()
  });
  console.log('Atlas write test SUCCESS:', testUser.insertedId);
  await db.collection('users').deleteOne({ _id: testUser.insertedId });
  console.log('Atlas test user deleted.');

  const admin = db.admin();
  const dbs = await admin.listDatabases();
  console.log('DATABASES AFTER CLEAN:', dbs.databases.find(d => d.name === 'jobportal'));

  process.exit(0);
}

dropAndClean().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
