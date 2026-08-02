export const SEARCH_PARAMS = {
  workModes: ['remote', 'hybrid', 'onsite'],
  employmentTypes: ['full-time', 'part-time', 'contract', 'internship', 'temporary'],
  experienceLevels: ['internship', 'fresher', 'junior', 'mid', 'senior', 'lead'],
  categories: ['technical', 'non-technical'],
  sources: ['recruiter', 'jooble', 'adzuna', 'arbeitnow', 'remotive', 'muse'],
  salaryRanges: [
    { label: 'Any salary', value: '' },
    { label: '50k+', value: 50000 },
    { label: '80k+', value: 80000 },
    { label: '100k+', value: 100000 },
    { label: '120k+', value: 120000 },
    { label: '150k+', value: 150000 },
  ],
};

export const COUNTRIES = [
  'USA', 'UK', 'Germany', 'India', 'Canada', 'Australia', 'France', 'Netherlands',
  'Spain', 'Brazil', 'Remote', 'Worldwide', 'Ireland', 'Poland', 'Sweden', 'Remote - Germany',
];

export const SAMPLE_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Java', 'Spring Boot', 'MongoDB',
  'Python', 'Django', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'DevOps', 'Machine Learning',
  'Data Science', 'UI/UX', 'QA', 'Sales', 'Marketing', 'HR', 'Communication', 'Finance',
  'Accounting', 'Customer Service', 'Project Management', 'SEO', 'Content Writing',
];
