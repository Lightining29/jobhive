const connectDB = require('../src/config/db');
const jobsController = require('../src/controllers/jobs.controller');

async function test() {
  await connectDB();

  const keywords = ['java', 'mern', 'python', 'react', 'node', 'sql', 'aws', 'sales', 'marketing'];
  for (const kw of keywords) {
    console.log(`\n==============================================`);
    console.log(`SEARCH QUERY: "${kw}"`);
    console.log(`==============================================`);
    const mockReq = { query: { search: kw, page: 1, limit: 5 } };
    const mockRes = {
      json: (data) => {
        console.log(`Found ${data.pagination?.total || data.jobs.length} matching jobs:`);
        data.jobs.slice(0, 5).forEach((j, i) => {
          console.log(`  ${i + 1}. [${j.companyName}] "${j.headline || j.jobTitle}"`);
          console.log(`     [Title] ${j.jobTitle}`);
          console.log(`     [Skills] ${(j.requiredSkills || []).join(', ')}`);
        });
      },
    };
    await jobsController.listJobs(mockReq, mockRes, console.error);
  }

  process.exit(0);
}

test().catch(console.error);
