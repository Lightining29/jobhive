const connectDB = require('../src/config/db');
const jobsController = require('../src/controllers/jobs.controller');

async function test() {
  await connectDB();

  const terms = ['mern', 'node js', 'nodejs', 'java', 'react'];
  for (const term of terms) {
    console.log(`\n=== SEARCH QUERY: "${term}" ===`);
    const mockReq = { query: { search: term, page: 1, limit: 10 } };
    const mockRes = {
      json: (data) => {
        console.log(`Found ${data.jobs.length} jobs for "${term}":`);
        data.jobs.forEach((j, i) => {
          console.log(`  ${i + 1}. [Heading/Title] ${j.jobTitle} | [Company] ${j.companyName} | [Skills] ${(j.requiredSkills || []).join(', ')}`);
        });
      },
    };
    await jobsController.listJobs(mockReq, mockRes, console.error);
  }

  process.exit(0);
}

test();
