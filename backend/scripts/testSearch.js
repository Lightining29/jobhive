const connectDB = require('../src/config/db');
const jobsController = require('../src/controllers/jobs.controller');

async function test() {
  await connectDB();

  const terms = ['java mern python', 'java', 'mern', 'python'];
  for (const term of terms) {
    console.log(`\n==============================================`);
    console.log(`SEARCH QUERY: "${term}"`);
    console.log(`==============================================`);
    const mockReq = { query: { search: term, page: 1, limit: 15 } };
    const mockRes = {
      json: (data) => {
        console.log(`Found ${data.jobs.length} matching jobs:`);
        data.jobs.forEach((j, i) => {
          console.log(`  ${i + 1}. [Title] ${j.jobTitle}`);
          console.log(`     [Heading/Headline] "${j.headline}"`);
          console.log(`     [Skills] ${(j.requiredSkills || []).join(', ')}`);
        });
      },
    };
    await jobsController.listJobs(mockReq, mockRes, console.error);
  }

  process.exit(0);
}

test();
