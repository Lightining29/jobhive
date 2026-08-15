const Bundle = require('../models/Bundle');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, buildPagination } = require('../utils/query');

const DEFAULT_BUNDLES = [
  {
    name: 'Recruiter Starter Kit',
    slug: 'recruiter-starter-kit',
    description: 'Everything you need to hire your first 3 candidates quickly',
    price: 99,
    originalPrice: 165,
    currency: 'USD',
    validityDays: 45,
    jobPostsIncluded: 5,
    featuredJobsIncluded: 2,
    urgentJobsIncluded: 1,
    profileViewsIncluded: 50,
    resumeDownloadsIncluded: 20,
    contactCreditsIncluded: 25,
  },
  {
    name: 'High-Volume Hiring Power Pack',
    slug: 'high-volume-power-pack',
    description: 'Designed for recruitment agencies and high-velocity hiring sprints',
    price: 299,
    originalPrice: 520,
    currency: 'USD',
    validityDays: 60,
    jobPostsIncluded: 20,
    featuredJobsIncluded: 8,
    urgentJobsIncluded: 5,
    profileViewsIncluded: 300,
    resumeDownloadsIncluded: 150,
    contactCreditsIncluded: 150,
  },
  {
    name: 'AI Fast-Track Recruitment Bundle',
    slug: 'ai-fast-track-bundle',
    description: 'AI resume screening, automated candidate matching & 10 instant job boosts',
    price: 199,
    originalPrice: 340,
    currency: 'USD',
    validityDays: 30,
    jobPostsIncluded: 10,
    featuredJobsIncluded: 5,
    urgentJobsIncluded: 3,
    profileViewsIncluded: 200,
    resumeDownloadsIncluded: 100,
    contactCreditsIncluded: 100,
  },
];

const seedBundlesIfEmpty = async () => {
  const count = await Bundle.countDocuments();
  if (count === 0) {
    await Bundle.insertMany(DEFAULT_BUNDLES);
  }
};

const listBundles = asyncHandler(async (req, res) => {
  await seedBundlesIfEmpty();
  const { page, limit, skip } = paginate(req.query);
  const filter = {};

  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
  if (req.query.search) {
    const term = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [{ name: { $regex: term, $options: 'i' } }, { description: { $regex: term, $options: 'i' } }];
  }

  const [bundles, total] = await Promise.all([
    Bundle.find(filter).populate('includedServices.service').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Bundle.countDocuments(filter),
  ]);

  res.json({ success: true, bundles, pagination: buildPagination(page, limit, total) });
});

const getBundle = asyncHandler(async (req, res, next) => {
  const bundle = await Bundle.findById(req.params.id).populate('includedServices.service');
  if (!bundle) return next(new ApiError(404, 'Bundle not found.'));
  res.json({ success: true, bundle });
});

const createBundle = asyncHandler(async (req, res, next) => {
  const { name, slug, description, price, originalPrice, currency, validityDays, includedServices, jobPostsIncluded, featuredJobsIncluded, urgentJobsIncluded, profileViewsIncluded, resumeDownloadsIncluded, contactCreditsIncluded, isActive, startsAt, expiresAt } = req.body;

  if (!name || price === undefined) return next(new ApiError(400, 'Bundle name and price are required.'));

  const finalSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const exists = await Bundle.findOne({ slug: finalSlug });
  if (exists) return next(new ApiError(409, 'A bundle with this slug already exists.'));

  const bundle = await Bundle.create({
    name,
    slug: finalSlug,
    description: description || '',
    price: Number(price) || 0,
    originalPrice: Number(originalPrice) || Number(price) || 0,
    currency: currency || 'USD',
    validityDays: Number(validityDays) || 30,
    includedServices: includedServices || [],
    jobPostsIncluded: Number(jobPostsIncluded) || 0,
    featuredJobsIncluded: Number(featuredJobsIncluded) || 0,
    urgentJobsIncluded: Number(urgentJobsIncluded) || 0,
    profileViewsIncluded: Number(profileViewsIncluded) || 0,
    resumeDownloadsIncluded: Number(resumeDownloadsIncluded) || 0,
    contactCreditsIncluded: Number(contactCreditsIncluded) || 0,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    startsAt: startsAt ? new Date(startsAt) : new Date(),
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
  });

  res.status(201).json({ success: true, message: 'Bundle created successfully.', bundle });
});

const updateBundle = asyncHandler(async (req, res, next) => {
  const bundle = await Bundle.findById(req.params.id);
  if (!bundle) return next(new ApiError(404, 'Bundle not found.'));

  const fields = [
    'name', 'description', 'price', 'originalPrice', 'currency', 'validityDays',
    'includedServices', 'jobPostsIncluded', 'featuredJobsIncluded', 'urgentJobsIncluded',
    'profileViewsIncluded', 'resumeDownloadsIncluded', 'contactCreditsIncluded',
    'isActive', 'startsAt', 'expiresAt',
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) bundle[field] = req.body[field];
  });

  if (req.body.slug && req.body.slug !== bundle.slug) {
    const cleanSlug = req.body.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = await Bundle.findOne({ slug: cleanSlug, _id: { $ne: bundle._id } });
    if (existing) return next(new ApiError(409, 'Bundle slug is already in use.'));
    bundle.slug = cleanSlug;
  }

  await bundle.save();
  res.json({ success: true, message: 'Bundle updated successfully.', bundle });
});

const deleteBundle = asyncHandler(async (req, res, next) => {
  const bundle = await Bundle.findByIdAndDelete(req.params.id);
  if (!bundle) return next(new ApiError(404, 'Bundle not found.'));
  res.json({ success: true, message: 'Bundle deleted successfully.' });
});

module.exports = {
  listBundles,
  getBundle,
  createBundle,
  updateBundle,
  deleteBundle,
};
