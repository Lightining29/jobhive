const Service = require('../models/Service');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, buildPagination } = require('../utils/query');

const DEFAULT_SERVICES = [
  { name: 'Job Posting Standard', slug: 'job-posting-standard', description: 'Post a single standard job vacancy for 30 days', category: 'job_posting', price: 29, durationDays: 30, usageLimit: 1, isSubscriptionOnly: false, canPurchaseSeparately: true },
  { name: 'Featured Job Badge', slug: 'featured-job-badge', description: 'Highlight job on top of search results and homepage with badge', category: 'job_posting', price: 49, durationDays: 30, usageLimit: 1, isSubscriptionOnly: false, canPurchaseSeparately: true },
  { name: 'Urgent Hiring Tag', slug: 'urgent-hiring-tag', description: 'Mark job as urgent to attract immediate active job seekers', category: 'job_posting', price: 19, durationDays: 14, usageLimit: 1, isSubscriptionOnly: false, canPurchaseSeparately: true },
  { name: 'Job 7-Day Auto Boost', slug: 'job-7day-boost', description: 'Bump job listing to top of search results daily for 7 days', category: 'job_posting', price: 35, durationDays: 7, usageLimit: 1, isSubscriptionOnly: false, canPurchaseSeparately: true },
  { name: 'Java / MERN / Python Specialist Hiring Slot', slug: 'specialist-developer-slot', description: 'Targeted spotlight placement for Java, MERN (React/Node) and Python engineering roles', category: 'job_posting', price: 59, durationDays: 30, usageLimit: 1, isSubscriptionOnly: false, canPurchaseSeparately: true },
  { name: 'Bulk Job Slot Pack (5 Postings)', slug: 'bulk-job-pack-5', description: 'Bundle of 5 verified job postings with 30-day validity', category: 'job_posting', price: 119, durationDays: 60, usageLimit: 5, isSubscriptionOnly: false, canPurchaseSeparately: true },
  { name: 'Enterprise Job Slot Pack (25 Postings)', slug: 'enterprise-job-pack-25', description: 'High-volume hiring package of 25 job postings with priority moderation', category: 'job_posting', price: 499, durationDays: 90, usageLimit: 25, isSubscriptionOnly: false, canPurchaseSeparately: true },
  { name: 'Resume Database Access', slug: 'resume-database-access', description: 'Search and filter millions of verified candidate resumes with direct download', category: 'candidate_access', price: 99, durationDays: 30, usageLimit: 100, isSubscriptionOnly: false, canPurchaseSeparately: true },
  { name: 'Candidate Contact Credits (50)', slug: 'candidate-contact-50', description: 'Unlock direct email and phone numbers of 50 candidates', category: 'candidate_access', price: 45, durationDays: 60, creditsGranted: 50, isSubscriptionOnly: false, canPurchaseSeparately: true },
  { name: 'Candidate Profile Unlock (10)', slug: 'candidate-unlock-10', description: 'Unlock 10 complete candidate profiles with portfolio and work history', category: 'candidate_access', price: 20, durationDays: 60, creditsGranted: 10, isSubscriptionOnly: false, canPurchaseSeparately: true },
  { name: 'Company Profile Promotion', slug: 'company-profile-promotion', description: 'Featured company profile in Employer directory and home showcase', category: 'branding', price: 79, durationDays: 30, isSubscriptionOnly: false, canPurchaseSeparately: true },
  { name: 'Homepage Banner Advertisement', slug: 'homepage-banner-ad', description: 'Exclusive hiring banner placed on high-traffic homepage', category: 'branding', price: 199, durationDays: 14, isSubscriptionOnly: false, canPurchaseSeparately: true },
  { name: 'Email Candidate Blast', slug: 'email-candidate-blast', description: 'Direct targeted email campaign sent to 1,000+ matching candidates', category: 'communication', price: 149, durationDays: 1, usageLimit: 1000, isSubscriptionOnly: false, canPurchaseSeparately: true },
  { name: 'WhatsApp Candidate Alert Blast', slug: 'whatsapp-candidate-blast', description: 'Instant verified WhatsApp notifications delivered to 500+ pre-vetted matching candidates', category: 'communication', price: 129, durationDays: 7, usageLimit: 500, isSubscriptionOnly: false, canPurchaseSeparately: true },
  { name: 'Bulk Candidate Messaging', slug: 'bulk-candidate-messaging', description: 'Send in-app chat invitations to 250 qualified candidates', category: 'communication', price: 59, durationDays: 30, creditsGranted: 250, isSubscriptionOnly: false, canPurchaseSeparately: true },
  { name: 'AI Resume Screening & Ranking', slug: 'ai-resume-screening', description: 'AI automatically screens and scores applicant resumes against job requirements', category: 'ai_tools', price: 39, durationDays: 30, usageLimit: 500, isSubscriptionOnly: false, canPurchaseSeparately: true },
  { name: 'AI Candidate Matching Engine', slug: 'ai-candidate-matching', description: 'Semantic AI engine recommends best-fit active talent automatically', category: 'ai_tools', price: 49, durationDays: 30, isSubscriptionOnly: false, canPurchaseSeparately: true },
  { name: 'AI Technical Coding Assessment Suite', slug: 'ai-coding-assessment', description: 'Automated live skill assessment and coding challenges in Java, JavaScript, Python, and SQL', category: 'ai_tools', price: 89, durationDays: 30, usageLimit: 100, isSubscriptionOnly: false, canPurchaseSeparately: true },
  { name: 'AI Job Description & SEO Optimizer', slug: 'ai-job-optimizer', description: 'Generate high-converting, keyword-optimized job descriptions with salary benchmarking', category: 'ai_tools', price: 15, durationDays: 30, usageLimit: 10, isSubscriptionOnly: false, canPurchaseSeparately: true },
  { name: 'Fast-Track Background Verification', slug: 'background-verification', description: 'Automated identity, educational degree, and employment verification check', category: 'verification', price: 39, durationDays: 30, usageLimit: 1, isSubscriptionOnly: false, canPurchaseSeparately: true },
  { name: 'Dedicated Talent Sourcing Specialist (Weekly)', slug: 'dedicated-sourcing-specialist', description: 'Dedicated recruitment specialist assigned to curate and deliver top shortlisted talent', category: 'other', price: 299, durationDays: 7, usageLimit: 1, isSubscriptionOnly: false, canPurchaseSeparately: true },
  { name: 'Recruiter Team Accounts (3 Seats)', slug: 'recruiter-team-3', description: 'Add 3 sub-recruiter team accounts with role-based permissions', category: 'other', price: 69, durationDays: 30, creditsGranted: 3, isSubscriptionOnly: false, canPurchaseSeparately: true },
];

const seedDefaultsIfEmpty = async () => {
  for (const s of DEFAULT_SERVICES) {
    await Service.updateOne({ slug: s.slug }, { $setOnInsert: s }, { upsert: true });
  }
};

const listServices = asyncHandler(async (req, res) => {
  await seedDefaultsIfEmpty();
  const { page, limit, skip } = paginate(req.query);
  const filter = {};

  if (req.query.category) filter.category = req.query.category;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
  if (req.query.search) {
    const term = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [{ name: { $regex: term, $options: 'i' } }, { description: { $regex: term, $options: 'i' } }];
  }

  const [services, total] = await Promise.all([
    Service.find(filter).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Service.countDocuments(filter),
  ]);

  res.json({ success: true, services, pagination: buildPagination(page, limit, total) });
});

const getService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);
  if (!service) return next(new ApiError(404, 'Service not found.'));
  res.json({ success: true, service });
});

const createService = asyncHandler(async (req, res, next) => {
  const { name, slug, description, icon, category, price, currency, durationDays, usageLimit, creditsGranted, taxPercent, discountPercent, isSubscriptionOnly, canPurchaseSeparately, isActive } = req.body;
  if (!name) return next(new ApiError(400, 'Service name is required.'));

  const finalSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const exists = await Service.findOne({ slug: finalSlug });
  if (exists) return next(new ApiError(409, 'A service with this slug already exists.'));

  const service = await Service.create({
    name,
    slug: finalSlug,
    description: description || '',
    icon: icon || 'FaBriefcase',
    category: category || 'job_posting',
    price: Number(price) || 0,
    currency: currency || 'USD',
    durationDays: Number(durationDays) || 30,
    usageLimit: Number(usageLimit) || 1,
    creditsGranted: Number(creditsGranted) || 0,
    taxPercent: Number(taxPercent) || 0,
    discountPercent: Number(discountPercent) || 0,
    isSubscriptionOnly: Boolean(isSubscriptionOnly),
    canPurchaseSeparately: canPurchaseSeparately !== undefined ? Boolean(canPurchaseSeparately) : true,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  res.status(201).json({ success: true, message: 'Service created successfully.', service });
});

const updateService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);
  if (!service) return next(new ApiError(404, 'Service not found.'));

  const fields = [
    'name', 'description', 'icon', 'category', 'price', 'currency',
    'durationDays', 'usageLimit', 'creditsGranted', 'taxPercent', 'discountPercent',
    'isSubscriptionOnly', 'canPurchaseSeparately', 'isActive', 'sortOrder',
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) service[field] = req.body[field];
  });

  if (req.body.slug && req.body.slug !== service.slug) {
    const slugClean = req.body.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = await Service.findOne({ slug: slugClean, _id: { $ne: service._id } });
    if (existing) return next(new ApiError(409, 'Slug is already in use by another service.'));
    service.slug = slugClean;
  }

  await service.save();
  res.json({ success: true, message: 'Service updated successfully.', service });
});

const toggleServiceStatus = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);
  if (!service) return next(new ApiError(404, 'Service not found.'));

  service.isActive = !service.isActive;
  await service.save();
  res.json({ success: true, message: `Service ${service.isActive ? 'activated' : 'deactivated'}.`, service });
});

const deleteService = asyncHandler(async (req, res, next) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) return next(new ApiError(404, 'Service not found.'));
  res.json({ success: true, message: 'Service deleted successfully.' });
});

module.exports = {
  listServices,
  getService,
  createService,
  updateService,
  toggleServiceStatus,
  deleteService,
};
