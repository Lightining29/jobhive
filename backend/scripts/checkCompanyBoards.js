const companies = [
  'tooljet', 'lambdatest', 'leenaai', 'classplus', 'rategain', 'saaslabs',
  'appinventiv', 'trackier', 'businessnext', 'netflix', 'spotify',
  'google', 'apple', 'xcelro', 'apprelix', 'travinkai', 'vinculum',
  'prismberry', 'unikove', 'sysacs', 'smdevops', 'leena-ai', 'saas-labs'
];

async function check() {
  console.log('Testing ATS endpoints using native fetch...');
  for (const c of companies) {
    // Greenhouse
    try {
      const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${c}/jobs`);
      if (res.ok) {
        const data = await res.json();
        if (data.jobs?.length) {
          console.log(`[Greenhouse] ${c}: ${data.jobs.length} live jobs`);
        }
      }
    } catch (_) {}

    // Lever
    try {
      const res = await fetch(`https://api.lever.co/v0/postings/${c}?mode=json`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          console.log(`[Lever] ${c}: ${data.length} live jobs`);
        }
      }
    } catch (_) {}

    // Ashby
    try {
      const res = await fetch('https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobBoardWithTeams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operationName: 'ApiJobBoardWithTeams',
          variables: { organizationHostedJobsPageName: c },
          query: `query ApiJobBoardWithTeams($organizationHostedJobsPageName: String!) {
            jobBoard: jobBoardWithTeams(organizationHostedJobsPageName: $organizationHostedJobsPageName) {
              jobPostings { id title }
            }
          }`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const jobs = data?.data?.jobBoard?.jobPostings;
        if (jobs && jobs.length) {
          console.log(`[Ashby] ${c}: ${jobs.length} live jobs`);
        }
      }
    } catch (_) {}
  }
}

check();
