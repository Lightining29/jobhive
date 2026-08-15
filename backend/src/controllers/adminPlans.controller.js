const SubscriptionPlan = require('../models/SubscriptionPlan');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, buildPagination } = require('../utils/query');

const DEFAULT_PLANS = [
  {
    name: 'Free Starter',
    slug: 'free-starter',
    description: 'Perfect for small companies and startups making their first hires',
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: 'USD',
    isFree: true,
    hasTrial: false,
    maxJobPosts: 2,
    featuredJobsIncluded: 0,
    urgentJobsIncluded: 0,
    jobBoostsIncluded: 0,
    candidateProfileViews: 10,
    resumeDownloads: 3,
    candidateContactCredits: 5,
    companyPromotion: false,
    aiResumeScreening: false,
    aiCandidateMatching: false,
    recruitmentAnalytics: false,
    teamMembers: 1,
    supportLevel: 'community',
    sortOrder: 1,
  },
  {
    name: 'Professional',
    slug: 'professional',
    description: 'Ideal for growing businesses with regular hiring needs',
    monthlyPrice: 79,
    yearlyPrice: 790,
    currency: 'USD',
    isFree: false,
    hasTrial: true,
    trialDays: 14,
    maxJobPosts: 10,
    featuredJobsIncluded: 2,
    urgentJobsIncluded: 1,
    jobBoostsIncluded: 2,
    candidateProfileViews: 100,
    resumeDownloads: 30,
    candidateContactCredits: 40,
    companyPromotion: true,
    aiResumeScreening: true,
    aiCandidateMatching: true,
    recruitmentAnalytics: true,
    teamMembers: 3,
    supportLevel: 'priority',
    isPopular: true,
    badgeText: 'Most Popular',
    sortOrder: 2,
  },
  {
    name: 'Business Pro',
    slug: 'business-pro',
    description: 'Designed for scaling tech companies, agencies, and enterprise recruitment',
    monthlyPrice: 199,
    yearlyPrice: 1990,
    currency: 'USD',
    isFree: false,
    hasTrial: true,
    trialDays: 30,
    maxJobPosts: 50,
    featuredJobsIncluded: 10,
    urgentJobsIncluded: 5,
    jobBoostsIncluded: 10,
    candidateProfileViews: 500,
    resumeDownloads: 150,
    candidateContactCredits: 200,
    companyPromotion: true,
    aiResumeScreening: true,
    aiCandidateMatching: true,
    recruitmentAnalytics: true,
    teamMembers: 10,
    supportLevel: 'dedicated_manager',
    badgeText: 'Best Value',
    sortOrder: 3,
  },
  {
    name: 'Enterprise Unlimited',
    slug: 'enterprise-unlimited',
    description: 'Unlimited recruitment power with dedicated SLAs and custom integrations',
    monthlyPrice: 499,
    yearlyPrice: 4990,
    currency: 'USD',
    isFree: false,
    hasTrial: true,
    trialDays: 30,
    maxJobPosts: -1, // unlimited
    featuredJobsIncluded: 30,
    urgentJobsIncluded: 15,
    jobBoostsIncluded: 25,
    candidateProfileViews: 2000,
    resumeDownloads: 1000,
    candidateContactCredits: 1000,
    companyPromotion: true,
    aiResumeScreening: true,
    aiCandidateMatching: true,
    recruitmentAnalytics: true,
    teamMembers: 50,
    supportLevel: '24_7_phone',
    sortOrder: 4,
  },
];

const seedPlansIfEmpty = async () => {
  const count = await SubscriptionPlan.countDocuments();
  if (count === 0) {
    await SubscriptionPlan.insertMany(DEFAULT_PLANS);
  }
};

const listPlans = asyncHandler(async (req, res) => {
  await seedPlansIfEmpty();
  const { page, limit, skip } = paginate(req.query);
  const filter = {};

  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
  if (req.query.isFree !== undefined) filter.isFree = req.query.isFree === 'true';

  const [plans, total] = await Promise.all([
    SubscriptionPlan.find(filter).populate('includedServices').sort({ sortOrder: 1, createdAt: 1 }).skip(skip).limit(limit).lean(),
    SubscriptionPlan.countDocuments(filter),
  ]);

  res.json({ success: true, plans, pagination: buildPagination(page, limit, total) });
});

const getPlan = asyncHandler(async (req, res, next) => {
  const plan = await SubscriptionPlan.findById(req.params.id).populate('includedServices');
  if (!plan) return next(new ApiError(404, 'Subscription plan not found.'));
  res.json({ success: true, plan });
});

const createPlan = asyncHandler(async (req, res, next) => {
  const { name, slug, description, monthlyPrice, yearlyPrice, currency, isFree, hasTrial, trialDays, trialOnlyForNewUsers, trialOncePerCompany, requirePaymentMethodForTrial, autoConvertToPaid, maxJobPosts, featuredJobsIncluded, urgentJobsIncluded, jobBoostsIncluded, candidateProfileViews, resumeDownloads, candidateContactCredits, companyPromotion, aiResumeScreening, aiCandidateMatching, recruitmentAnalytics, teamMembers, supportLevel, includedServices, badgeText, isPopular, isActive } = req.body;

  if (!name) return next(new ApiError(400, 'Plan name is required.'));

  const finalSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const exists = await SubscriptionPlan.findOne({ slug: finalSlug });
  if (exists) return next(new ApiError(409, 'A plan with this slug already exists.'));

  const plan = await SubscriptionPlan.create({
    name,
    slug: finalSlug,
    description: description || '',
    monthlyPrice: isFree ? 0 : Number(monthlyPrice) || 0,
    yearlyPrice: isFree ? 0 : Number(yearlyPrice) || 0,
    currency: currency || 'USD',
    isFree: Boolean(isFree),
    hasTrial: Boolean(hasTrial),
    trialDays: Number(trialDays) || 14,
    trialOnlyForNewUsers: trialOnlyForNewUsers !== undefined ? Boolean(trialOnlyForNewUsers) : true,
    trialOncePerCompany: trialOncePerCompany !== undefined ? Boolean(trialOncePerCompany) : true,
    requirePaymentMethodForTrial: Boolean(requirePaymentMethodForTrial),
    autoConvertToPaid: autoConvertToPaid !== undefined ? Boolean(autoConvertToPaid) : true,
    maxJobPosts: Number(maxJobPosts) ?? 5,
    featuredJobsIncluded: Number(featuredJobsIncluded) || 0,
    urgentJobsIncluded: Number(urgentJobsIncluded) || 0,
    jobBoostsIncluded: Number(jobBoostsIncluded) || 0,
    candidateProfileViews: Number(candidateProfileViews) || 20,
    resumeDownloads: Number(resumeDownloads) || 10,
    candidateContactCredits: Number(candidateContactCredits) || 10,
    companyPromotion: Boolean(companyPromotion),
    aiResumeScreening: Boolean(aiResumeScreening),
    aiCandidateMatching: Boolean(aiCandidateMatching),
    recruitmentAnalytics: Boolean(recruitmentAnalytics),
    teamMembers: Number(teamMembers) || 1,
    supportLevel: supportLevel || 'email',
    includedServices: includedServices || [],
    badgeText: badgeText || '',
    isPopular: Boolean(isPopular),
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  res.status(201).json({ success: true, message: 'Subscription plan created successfully.', plan });
});

const updatePlan = asyncHandler(async (req, res, next) => {
  const plan = await SubscriptionPlan.findById(req.params.id);
  if (!plan) return next(new ApiError(404, 'Subscription plan not found.'));

  const fields = [
    'name', 'description', 'monthlyPrice', 'yearlyPrice', 'currency',
    'isFree', 'hasTrial', 'trialDays', 'trialOnlyForNewUsers', 'trialOncePerCompany',
    'requirePaymentMethodForTrial', 'autoConvertToPaid', 'maxJobPosts',
    'featuredJobsIncluded', 'urgentJobsIncluded', 'jobBoostsIncluded',
    'candidateProfileViews', 'resumeDownloads', 'candidateContactCredits',
    'companyPromotion', 'aiResumeScreening', 'aiCandidateMatching',
    'recruitmentAnalytics', 'teamMembers', 'supportLevel', 'includedServices',
    'badgeText', 'isPopular', 'isActive', 'sortOrder',
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) plan[field] = req.body[field];
  });

  if (req.body.slug && req.body.slug !== plan.slug) {
    const cleanSlug = req.body.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = await SubscriptionPlan.findOne({ slug: cleanSlug, _id: { $ne: plan._id } });
    if (existing) return next(new ApiError(409, 'Slug is already in use by another plan.'));
    plan.slug = cleanSlug;
  }

  await plan.save();
  res.json({ success: true, message: 'Subscription plan updated successfully.', plan });
});

const togglePlanStatus = asyncHandler(async (req, res, next) => {
  const plan = await SubscriptionPlan.findById(req.params.id);
  if (!plan) return next(new ApiError(404, 'Subscription plan not found.'));

  plan.isActive = !plan.isActive;
  await plan.save();
  res.json({ success: true, message: `Plan ${plan.isActive ? 'activated' : 'deactivated'}.`, plan });
});

const deletePlan = asyncHandler(async (req, res, next) => {
  const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);
  if (!plan) return next(new ApiError(404, 'Subscription plan not found.'));
  res.json({ success: true, message: 'Subscription plan deleted successfully.' });
});

module.exports = {
  listPlans,
  getPlan,
  createPlan,
  updatePlan,
  togglePlanStatus,
  deletePlan,
};
