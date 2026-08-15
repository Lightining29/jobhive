const connectDB = require('../src/config/db');
const mongoose = require('mongoose');

async function shrinkJobsCollection() {
  await connectDB();
  const db = mongoose.connection.db;

  console.log('Fetching remaining jobs into memory...');
  const currentJobs = await db.collection('jobs').find({}).toArray();
  console.log(`Loaded ${currentJobs.length} jobs.`);

  const indexes = await db.collection('jobs').indexes();
  console.log('Current indexes:', indexes.map(i => i.name));

  console.log('Dropping collection to reclaim disk space from WiredTiger...');
  await db.collection('jobs').drop();
  console.log('Jobs collection dropped.');

  console.log('Re-inserting jobs into fresh clean collection...');
  if (currentJobs.length > 0) {
    await db.collection('jobs').insertMany(currentJobs);
    console.log(`Re-inserted ${currentJobs.length} jobs.`);
  }

  // Re-create necessary indexes
  await db.collection('jobs').createIndex({ slug: 1 }, { unique: true, sparse: true });
  await db.collection('jobs').createIndex({ category: 1 });
  await db.collection('jobs').createIndex({ workMode: 1 });
  await db.collection('jobs').createIndex({ employmentType: 1 });
  await db.collection('jobs').createIndex({ experienceLevel: 1 });
  await db.collection('jobs').createIndex({ createdAt: -1 });
  await db.collection('jobs').createIndex({ title: 'text', description: 'text', skills: 'text' });
  console.log('Indexes recreated.');

  const admin = db.admin();
  const dbs = await admin.listDatabases();
  console.log('New database sizes:', dbs.databases.find(d => d.name === 'jobportal'));

  // Test insert a user
  const testUser = await db.collection('users').insertOne({
    name: 'Storage Test',
    email: 'test_' + Date.now() + '@example.com',
    role: 'candidate',
    createdAt: new Date(),
  });
  console.log('SUCCESS! Test insert succeeded with id:', testUser.insertedId);
  await db.collection('users').deleteOne({ _id: testUser.insertedId });
  console.log('Test user cleaned up successfully!');

  process.exit(0);
}

shrinkJobsCollection().catch(err => {
  console.error('Error shrinking collection:', err);
  process.exit(1);
});
