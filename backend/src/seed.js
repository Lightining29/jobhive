require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Company = require('./models/Company');

const DEMO_COMPANIES = [
  { name: 'TechNova Solutions', website: 'https://technova.example.com', industry: 'Software', size: '100-500', description: 'Enterprise software solutions company.' },
  { name: 'DataBridge Labs', website: 'https://databridge.example.com', industry: 'Data', size: '50-100', description: 'Data infrastructure and APIs.' },
  { name: 'GrowthHub', website: 'https://growthhub.example.com', industry: 'SaaS', size: '10-50', description: 'B2B SaaS platform.' },
  { name: 'NeuralIQ', website: 'https://neuralsiq.example.com', industry: 'AI', size: '50-100', description: 'Applied AI research.' },
  { name: 'CloudWorks', website: 'https://cloudworks.example.com', industry: 'Cloud', size: '100-500', description: 'Cloud-native development studio.' },
];

const seed = async () => {
  await connectDB();
  console.log('Seeding database...');

  await User.deleteMany({});
  await Company.deleteMany({});

  const admin = await User.create({
    name: 'Manish Kumar',
    email: 'brayw433@gmail.com',
    password: 'Manish@123',
    role: 'admin',
    adminRole: 'super_admin',
    permissions: ['all', 'services', 'plans', 'coupons', 'bundles', 'users', 'jobs', 'companies', 'payments', 'reports', 'settings', 'roles', 'notifications'],
    emailVerified: true,
  });

  const candidate = await User.create({
    name: 'Riya Sharma',
    email: 'candidate@jobhive.com',
    password: 'candidate123',
    role: 'candidate',
    emailVerified: true,
    headline: 'Full Stack Developer (Java + MERN)',
    bio: 'Passionate software engineer with 4 years of experience building scalable web applications with Java, Spring Boot, React, and MongoDB.',
    skills: ['Java', 'Spring Boot', 'MongoDB', 'React', 'Node.js', 'Express'],
    experience: [
      { role: 'Backend Engineer', company: 'FinEdge', startDate: new Date('2021-01-01'), current: true, description: 'Building microservices with Spring Boot.' },
      { role: 'Junior Developer', company: 'TechNova', startDate: new Date('2019-06-01'), endDate: new Date('2020-12-31'), description: 'Full stack development.' },
    ],
    education: [{ institution: 'IIT Delhi', degree: 'B.Tech', fieldOfStudy: 'Computer Science', startYear: 2015, endYear: 2019 }],
    preferences: {
      preferredLocations: ['San Francisco', 'New York', 'Remote'],
      preferredSalary: 100000,
      preferredWorkMode: 'hybrid',
      preferredEmploymentType: 'full-time',
      preferredCategory: 'technical',
    },
  });

  const recruiter = await User.create({
    name: 'Alex Morgan',
    email: 'recruiter@jobhive.com',
    password: 'recruiter123',
    role: 'recruiter',
    emailVerified: true,
    headline: 'Talent Acquisition at TechNova',
  });

  const companyDocs = [];
  for (const c of DEMO_COMPANIES) {
    const company = await Company.create({
      ...c,
      slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      owner: recruiter._id,
      verified: true,
      verifiedAt: new Date(),
    });
    companyDocs.push(company);
  }
  const techNova = companyDocs[0];
  recruiter.company = techNova._id;
  await recruiter.save();

  console.log(`Seeded: admin, candidate, recruiter, ${companyDocs.length} companies. No jobs created (recruiters post real jobs).`);
  console.log('Demo accounts:');
  console.log('  Admin     -> admin@jobhive.com / admin12345');
  console.log('  Candidate -> candidate@jobhive.com / candidate123');
  console.log('  Recruiter -> recruiter@jobhive.com / recruiter123');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
