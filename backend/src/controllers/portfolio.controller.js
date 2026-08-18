const mongoose = require('mongoose');
const PortfolioMongo = require('../models/Portfolio');
const PortfolioSQL = require('../models/sql/Portfolio.sql');
const UserMongo = require('../models/User');
const UserSQL = require('../models/sql/User.sql');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// Skill classification dictionary
const SKILL_CATEGORY_MAP = {
  'Programming Languages': ['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'golang', 'go', 'ruby', 'php', 'rust', 'swift', 'kotlin', 'dart', 'c', 'scala'],
  'Frontend Development': ['react', 'next.js', 'vue', 'angular', 'svelte', 'html', 'html5', 'css', 'css3', 'tailwind', 'tailwindcss', 'redux', 'bootstrap', 'sass', 'vite', 'webpack'],
  'Backend & APIs': ['node.js', 'nodejs', 'express', 'nest.js', 'django', 'flask', 'fastapi', 'spring boot', 'spring', 'laravel', 'graphql', 'rest api', 'microservices', 'grpc'],
  'Databases & Storage': ['mongodb', 'postgresql', 'postgres', 'mysql', 'sql', 'redis', 'elasticsearch', 'dynamodb', 'sqlite', 'cassandra', 'firebase', 'prisma'],
  'Cloud & DevOps': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'terraform', 'linux', 'nginx', 'jenkins', 'github actions', 'cloud architecture'],
  'AI & Machine Learning': ['machine learning', 'deep learning', 'pytorch', 'tensorflow', 'openai', 'llm', 'nlp', 'langchain', 'data science', 'pandas', 'numpy', 'scikit-learn'],
  'Tools & Architecture': ['git', 'github', 'jira', 'figma', 'postman', 'swagger', 'agile', 'scrum', 'system design', 'oauth'],
  'Soft Skills': ['communication', 'leadership', 'problem solving', 'teamwork', 'critical thinking', 'project management', 'mentoring'],
};

const categorizeSkills = (rawSkills = []) => {
  if (!Array.isArray(rawSkills) || !rawSkills.length) return [];
  const normalized = rawSkills.map(s => (typeof s === 'string' ? s.trim() : '')).filter(Boolean);
  const categories = [];
  const matchedSkills = new Set();

  Object.entries(SKILL_CATEGORY_MAP).forEach(([categoryName, keywords]) => {
    const found = normalized.filter(skill => {
      const lower = skill.toLowerCase();
      return keywords.some(k => lower === k || lower.includes(k) || k.includes(lower));
    });
    if (found.length > 0) {
      categories.push({
        name: categoryName,
        skills: [...new Set(found)],
      });
      found.forEach(s => matchedSkills.add(s));
    }
  });

  const remaining = normalized.filter(s => !matchedSkills.has(s));
  if (remaining.length > 0) {
    categories.push({
      name: 'Technical Competencies',
      skills: remaining,
    });
  }

  return categories;
};

const generateActionBullets = (role, company, description, skills = []) => {
  if (description && description.trim().length > 10) {
    const rawLines = description
      .split(/\n|[•·▪]/)
      .map(l => l.replace(/^\d+[\.)]\s*/, '').trim())
      .filter(l => l.length > 8);
    if (rawLines.length > 0) return rawLines.slice(0, 5);
  }
  const bullets = [];
  if (role) {
    bullets.push(`Architected and delivered high-performance software modules as a ${role} at ${company || 'the organization'}.`);
  }
  if (skills && skills.length) {
    bullets.push(`Leveraged ${skills.slice(0, 3).join(', ')} to streamline product workflows, ensure data integrity, and optimize operational velocity.`);
  }
  bullets.push(`Collaborated with cross-functional engineering teams to implement clean, scalable, and maintainable codebase standards.`);
  return bullets;
};

const deriveServices = (skills = [], headline = '') => {
  const text = `${skills.join(' ')} ${headline}`.toLowerCase();
  const services = [];

  if (text.includes('react') || text.includes('frontend') || text.includes('vue') || text.includes('angular') || text.includes('next')) {
    services.push({
      title: 'Modern Frontend Engineering',
      description: 'Crafting responsive, high-performance web applications with modern component architectures, fluid UX animations, and accessible designs.',
      icon: 'layout',
    });
  }
  if (text.includes('node') || text.includes('backend') || text.includes('python') || text.includes('java') || text.includes('api') || text.includes('sql') || text.includes('spring')) {
    services.push({
      title: 'Scalable Backend & APIs',
      description: 'Engineering robust REST/GraphQL APIs, microservices, secure authentication flows, and resilient database architectures.',
      icon: 'server',
    });
  }
  if (text.includes('aws') || text.includes('docker') || text.includes('cloud') || text.includes('devops') || text.includes('ci/cd')) {
    services.push({
      title: 'Cloud Architecture & DevOps',
      description: 'Implementing automated CI/CD pipelines, container orchestration, and secure cloud infrastructure deployments.',
      icon: 'cloud',
    });
  }
  if (text.includes('ai') || text.includes('machine learning') || text.includes('deep learning') || text.includes('llm') || text.includes('data')) {
    services.push({
      title: 'AI & Data Integration',
      description: 'Integrating intelligent AI models, vector embeddings, semantic search, and data processing workflows.',
      icon: 'brain',
    });
  }
  if (!services.length) {
    services.push({
      title: 'Full-Cycle Software Engineering',
      description: 'End-to-end development of scalable digital applications tailored to business requirements with precision and velocity.',
      icon: 'code',
    });
  }
  return services.slice(0, 4);
};

const generateUniqueSlug = async (name = 'developer') => {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'portfolio';

  let slug = base;
  let counter = 1;

  while (true) {
    let exists = false;
    try {
      exists = await PortfolioMongo.findOne({ slug });
    } catch (e) {}
    if (!exists) {
      try {
        exists = await PortfolioSQL.findOne({ where: { slug } });
      } catch (e) {}
    }
    if (!exists) break;
    counter++;
    slug = `${base}-${counter}`;
  }
  return slug;
};

// ── 1. One-Click AI Generate Portfolio ──────────────────────────────
const generatePortfolio = asyncHandler(async (req, res, next) => {
  let user = null;
  try {
    user = await UserMongo.findById(req.user.id);
  } catch (e) {}
  if (!user) {
    try {
      user = await UserSQL.findByPk(req.user.id);
    } catch (e) {}
  }
  if (!user) return next(new ApiError(404, 'User profile not found.'));

  const rawUser = typeof user.toJSON === 'function' ? user.toJSON() : user;
  const name = rawUser.name || 'Developer';
  const headline = rawUser.headline || 'Software Engineer';
  const bio = rawUser.bio || `Passionate ${headline} dedicated to engineering reliable, scalable, and user-centric software solutions.`;
  const skillsList = Array.isArray(rawUser.skills) ? rawUser.skills : [];
  const categorizedSkills = categorizeSkills(skillsList);

  // Compute years of experience
  const expList = Array.isArray(rawUser.experience) ? rawUser.experience : [];
  let totalYears = 0;
  expList.forEach((exp) => {
    if (!exp.startDate) return;
    const end = exp.current ? new Date() : exp.endDate ? new Date(exp.endDate) : new Date();
    const yrs = (end - new Date(exp.startDate)) / (365.25 * 24 * 60 * 60 * 1000);
    if (yrs > 0) totalYears += yrs;
  });
  const experienceYears = Math.max(0, Math.min(Math.round(totalYears * 10) / 10, 40));

  // Rewrite experience with action-oriented bullets
  const formattedExperience = expList.map((exp) => ({
    role: exp.role || headline,
    company: exp.company || 'Technology Company',
    duration: exp.current ? 'Present' : (exp.startDate && exp.endDate ? `${new Date(exp.startDate).getFullYear()} - ${new Date(exp.endDate).getFullYear()}` : 'Past'),
    startDate: exp.startDate,
    endDate: exp.endDate,
    current: !!exp.current,
    location: exp.location || '',
    description: exp.description || '',
    bullets: generateActionBullets(exp.role, exp.company, exp.description, skillsList),
    technologies: skillsList.slice(0, 4),
  }));

  // Clean education
  const eduList = Array.isArray(rawUser.education) ? rawUser.education : [];
  const formattedEducation = eduList.map((edu) => ({
    degree: edu.degree || 'Degree',
    institution: edu.institution || 'University',
    fieldOfStudy: edu.fieldOfStudy || '',
    startYear: edu.startYear || null,
    endYear: edu.endYear || null,
    grade: edu.grade || '',
  }));

  // Clean certifications
  const certList = Array.isArray(rawUser.certifications) ? rawUser.certifications : [];
  const formattedCertifications = certList.map((c) => ({
    name: c.name || '',
    issuer: c.issuer || '',
    year: c.year || null,
    credentialId: c.credentialId || '',
    verificationUrl: c.link || c.verificationUrl || '',
  }));

  // Clean projects
  const projList = Array.isArray(rawUser.projects) ? rawUser.projects : [];
  const formattedProjects = projList.map((p) => ({
    title: p.title || p.name || 'Software Project',
    description: p.description || 'Full-stack software application built with modern architecture and modular design.',
    problem: p.problem || 'Solving user workflow challenges with real-time digital automation.',
    solution: p.solution || 'Engineered an intuitive interface backed by performant services and secure APIs.',
    features: Array.isArray(p.features) && p.features.length ? p.features : ['Modular UI architecture', 'Secure API endpoints', 'Optimized data pipeline'],
    technologies: Array.isArray(p.technologies) ? p.technologies : skillsList.slice(0, 3),
    githubUrl: p.githubUrl || p.github || '',
    liveUrl: p.liveUrl || p.link || '',
    imageUrl: p.imageUrl || '',
  }));

  // Extract social links
  const social = rawUser.socialLinks || {};
  const resumeUrl = rawUser.resume?.url || '';

  // Check if existing portfolio already exists for user
  let existing = null;
  try {
    existing = await PortfolioMongo.findOne({ user: req.user.id });
  } catch (e) {}
  if (!existing) {
    try {
      existing = await PortfolioSQL.findOne({ where: { userId: req.user.id } });
    } catch (e) {}
  }

  const slug = existing ? existing.slug : await generateUniqueSlug(name);
  const theme = existing?.theme || 'modern_tech';

  const portfolioPayload = {
    user: req.user.id,
    userId: req.user.id,
    slug,
    theme,
    isPublished: true,
    themeSettings: existing?.themeSettings || {
      accentColor: '#00f0ff',
      font: 'Plus Jakarta Sans',
      layout: 'standard',
    },
    hero: {
      name,
      title: headline,
      tagline: `Building scalable, user-focused digital solutions with ${skillsList.slice(0, 3).join(', ') || 'modern technology'}.`,
      bioShort: bio.slice(0, 220),
      avatar: rawUser.avatar || '',
      ctaHire: 'Hire Me',
      ctaWork: 'View My Work',
      showResume: !!resumeUrl,
      resumeUrl,
      github: social.github || '',
      linkedin: social.linkedin || '',
      email: rawUser.email || '',
      phone: rawUser.phone || '',
      phonePublic: false,
      location: rawUser.preferences?.preferredLocations?.[0] || 'Remote / Worldwide',
    },
    about: {
      summary: bio,
      highlights: [
        experienceYears > 0 ? `${experienceYears}+ years delivering robust production software.` : 'Strong foundational engineering background with modern toolchains.',
        `Specialized in ${skillsList.slice(0, 4).join(', ') || 'software development'}.`,
        'Passionate about clean architecture, performance optimization, and developer experience.',
      ],
      experienceYears,
      openToRoles: rawUser.preferences?.preferredJobTitle ? [rawUser.preferences.preferredJobTitle] : [headline, 'Full Stack Engineer'],
    },
    skills: {
      categories: categorizedSkills,
    },
    experience: formattedExperience,
    projects: formattedProjects,
    education: formattedEducation,
    certifications: formattedCertifications,
    achievements: Array.isArray(rawUser.achievements) ? rawUser.achievements : [],
    services: deriveServices(skillsList, headline),
    seo: {
      title: `${name} | ${headline} Portfolio`,
      metaDescription: `${name} is a ${headline} specializing in ${skillsList.slice(0, 5).join(', ')}. Explore verified work, projects, and professional background.`,
      keywords: [name, headline, ...skillsList],
    },
  };

  let saved = null;
  // Save to MongoDB if available
  try {
    saved = await PortfolioMongo.findOneAndUpdate(
      { user: req.user.id },
      { $set: portfolioPayload },
      { new: true, upsert: true }
    );
  } catch (e) {}

  // Save to SQL if available
  try {
    const [sqlItem] = await PortfolioSQL.upsert({
      ...portfolioPayload,
      userId: req.user.id,
      slug,
    });
    if (!saved) saved = sqlItem;
  } catch (e) {}

  res.status(200).json({
    success: true,
    message: 'AI Portfolio successfully generated!',
    portfolio: saved || portfolioPayload,
    publicUrl: `/portfolio/${slug}`,
  });
});

// ── 2. Get My Portfolio ─────────────────────────────────────────────
const getMyPortfolio = asyncHandler(async (req, res) => {
  let portfolio = null;
  try {
    portfolio = await PortfolioMongo.findOne({ user: req.user.id });
  } catch (e) {}
  if (!portfolio) {
    try {
      portfolio = await PortfolioSQL.findOne({ where: { userId: req.user.id } });
    } catch (e) {}
  }

  res.json({
    success: true,
    hasPortfolio: !!portfolio,
    portfolio: portfolio || null,
  });
});

// ── 3. Update Portfolio ─────────────────────────────────────────────
const updateMyPortfolio = asyncHandler(async (req, res, next) => {
  const updates = req.body;
  let portfolio = null;

  if (updates.slug) {
    updates.slug = updates.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    // Check collision
    try {
      const dup = await PortfolioMongo.findOne({ slug: updates.slug, user: { $ne: req.user.id } });
      if (dup) return next(new ApiError(400, 'This portfolio URL slug is already taken.'));
    } catch (e) {}
  }

  try {
    portfolio = await PortfolioMongo.findOneAndUpdate(
      { user: req.user.id },
      { $set: updates },
      { new: true }
    );
  } catch (e) {}

  try {
    await PortfolioSQL.update(updates, { where: { userId: req.user.id } });
    if (!portfolio) {
      portfolio = await PortfolioSQL.findOne({ where: { userId: req.user.id } });
    }
  } catch (e) {}

  if (!portfolio) return next(new ApiError(404, 'Portfolio not found. Please click Generate first.'));

  res.json({
    success: true,
    message: 'Portfolio updated successfully.',
    portfolio,
  });
});

// ── 4. Public Portfolio View ────────────────────────────────────────
const getPublicPortfolio = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  let portfolio = null;

  try {
    portfolio = await PortfolioMongo.findOne({ slug: slug.toLowerCase() });
    if (portfolio) {
      portfolio.views = (portfolio.views || 0) + 1;
      await portfolio.save().catch(() => {});
    }
  } catch (e) {}

  if (!portfolio) {
    try {
      portfolio = await PortfolioSQL.findOne({ where: { slug: slug.toLowerCase() } });
      if (portfolio) {
        portfolio.views = (portfolio.views || 0) + 1;
        await portfolio.save().catch(() => {});
      }
    } catch (e) {}
  }

  if (!portfolio) {
    return next(new ApiError(404, 'Portfolio not found.'));
  }

  if (!portfolio.isPublished) {
    return res.status(403).json({
      success: false,
      message: 'This portfolio is currently private by the author.',
    });
  }

  res.json({
    success: true,
    portfolio,
  });
});

module.exports = {
  generatePortfolio,
  getMyPortfolio,
  updateMyPortfolio,
  getPublicPortfolio,
};
