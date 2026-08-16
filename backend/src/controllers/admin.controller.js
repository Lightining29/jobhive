const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const Coupon = require('../models/Coupon');
const Bundle = require('../models/Bundle');
const Service = require('../models/Service');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const SystemSetting = require('../models/SystemSetting');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, buildPagination } = require('../utils/query');

const dashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    users, candidates, recruiters, companies,
    activeJobs, pendingJobs, totalJobs,
    applications, openReports,
    jobsToday, applicationsToday, usersToday,
    activeSubscriptions, trialUsers,
    monthlyRevenueAgg, totalRevenueAgg,
    couponStatsAgg,
    recentUsers, recentJobs, recentPayments, recentReports,
    jobsByCategory, jobsBySource,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'candidate' }),
    User.countDocuments({ role: 'recruiter' }),
    Company.countDocuments(),
    Job.countDocuments({ isActive: true, isExpired: false }),
    Job.countDocuments({ isVerified: false, isExpired: false }),
    Job.countDocuments(),
    Application.countDocuments(),
    Report.countDocuments({ status: 'open' }),
    Job.countDocuments({ createdAt: { $gte: dayStart } }),
    Application.countDocuments({ createdAt: { $gte: dayStart } }),
    User.countDocuments({ createdAt: { $gte: dayStart } }),
    User.countDocuments({ 'subscription.status': 'active', 'subscription.isTrial': false }),
    User.countDocuments({ 'subscription.status': 'trial', 'subscription.isTrial': true }),
    Transaction.aggregate([
      { $match: { status: 'succeeded', createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Transaction.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Coupon.aggregate([
      { $group: { _id: null, totalUsed: { $sum: '$timesUsed' }, totalDiscount: { $sum: '$totalDiscountGiven' } } },
    ]),
    User.find().sort({ createdAt: -1 }).limit(6).select('name email role avatar status subscription createdAt').lean(),
    Job.find().sort({ createdAt: -1 }).limit(6).select('jobTitle companyName category isVerified isActive trendingScore createdAt').lean(),
    Transaction.find().sort({ createdAt: -1 }).limit(6).populate('user', 'name email role').lean(),
    Report.find({ status: 'open' }).sort({ createdAt: -1 }).limit(6).populate('reportedBy', 'name email').lean(),
    Job.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    Job.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),
  ]);

  const monthlyRevenue = (monthlyRevenueAgg[0] && monthlyRevenueAgg[0].total) || 0;
  const totalRevenue = (totalRevenueAgg[0] && totalRevenueAgg[0].total) || 0;
  const couponStats = couponStatsAgg[0] || { totalUsed: 0, totalDiscount: 0 };

  res.json({
    success: true,
    stats: {
      users,
      candidates,
      recruiters,
      companies,
      activeJobs,
      pendingJobs,
      totalJobs,
      applications,
      openReports,
      jobsToday,
      applicationsToday,
      usersToday,
      activeSubscriptions,
      trialUsers,
      monthlyRevenue,
      totalRevenue,
      couponUsage: couponStats.totalUsed,
      totalDiscountGiven: couponStats.totalDiscount,
      jobsByCategory: Object.fromEntries(jobsByCategory.map((j) => [j._id || 'other', j.count])),
      jobsBySource: Object.fromEntries(jobsBySource.map((j) => [j._id || 'direct', j.count])),
    },
    recentUsers,
    recentJobs,
    recentPayments,
    recentReports,
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.subscriptionStatus) filter['subscription.status'] = req.query.subscriptionStatus;
  if (req.query.search) {
    const term = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [{ name: { $regex: term, $options: 'i' } }, { email: { $regex: term, $options: 'i' } }];
  }

  const [users, total] = await Promise.all([
    User.find(filter).populate('company').populate('subscription.plan').sort({ createdAt: -1 }).skip(skip).limit(limit).select('-password').lean(),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, users, pagination: buildPagination(page, limit, total) });
});

const getUserDetails = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .populate('company')
    .populate('subscription.plan')
    .select('-password');

  if (!user) return next(new ApiError(404, 'User not found.'));

  const [transactions, applications, postedJobs] = await Promise.all([
    Transaction.find({ user: user._id }).sort({ createdAt: -1 }).limit(20).lean(),
    Application.find({ candidate: user._id }).populate('job').sort({ createdAt: -1 }).limit(20).lean(),
    user.role === 'recruiter' ? Job.find({ postedBy: user._id }).sort({ createdAt: -1 }).limit(20).lean() : [],
  ]);

  res.json({ success: true, user, transactions, applications, postedJobs });
});

const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ApiError(404, 'User not found.'));
  if (user.role === 'admin' && req.body.status === 'suspended' && req.user._id.toString() !== user._id.toString()) {
    return next(new ApiError(400, 'Cannot suspend another admin.'));
  }
  if (req.body.status) user.status = req.body.status;
  if (req.body.name) user.name = req.body.name;
  if (req.body.phone) user.phone = req.body.phone;
  if (req.body.headline) user.headline = req.body.headline;
  if (req.body.emailVerified !== undefined) user.emailVerified = req.body.emailVerified;

  await user.save();
  res.json({ success: true, message: 'User updated.', user: user.toSafeJSON() });
});

const grantUserCredits = asyncHandler(async (req, res, next) => {
  const { jobPosts = 0, featuredJobs = 0, urgentJobs = 0, profileViews = 0, resumeDownloads = 0, contactCredits = 0 } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return next(new ApiError(404, 'User not found.'));

  if (!user.credits) {
    user.credits = { jobPosts: 0, featuredJobs: 0, urgentJobs: 0, profileViews: 0, resumeDownloads: 0, contactCredits: 0 };
  }

  user.credits.jobPosts = Math.max(0, (user.credits.jobPosts || 0) + Number(jobPosts));
  user.credits.featuredJobs = Math.max(0, (user.credits.featuredJobs || 0) + Number(featuredJobs));
  user.credits.urgentJobs = Math.max(0, (user.credits.urgentJobs || 0) + Number(urgentJobs));
  user.credits.profileViews = Math.max(0, (user.credits.profileViews || 0) + Number(profileViews));
  user.credits.resumeDownloads = Math.max(0, (user.credits.resumeDownloads || 0) + Number(resumeDownloads));
  user.credits.contactCredits = Math.max(0, (user.credits.contactCredits || 0) + Number(contactCredits));

  await user.save();

  await Notification.create({
    user: user._id,
    type: 'system',
    title: 'Credits Added to Your Account',
    message: `Admin granted you promotional hiring credits. Check your recruiter dashboard to use them!`,
    link: '/recruiter/dashboard',
  });

  res.json({ success: true, message: 'Credits granted successfully.', credits: user.credits });
});

const extendUserTrial = asyncHandler(async (req, res, next) => {
  const { additionalDays = 14 } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return next(new ApiError(404, 'User not found.'));

  const currentTrialEnd = user.subscription?.trialEndsAt && new Date(user.subscription.trialEndsAt) > new Date()
    ? new Date(user.subscription.trialEndsAt)
    : new Date();

  const newTrialEnd = new Date(currentTrialEnd.getTime() + Number(additionalDays) * 24 * 60 * 60 * 1000);

  user.subscription = {
    ...user.subscription,
    status: 'trial',
    isTrial: true,
    trialEndsAt: newTrialEnd,
  };

  await user.save();

  await Notification.create({
    user: user._id,
    type: 'system',
    title: 'Free Trial Extended!',
    message: `Your free trial has been extended by ${additionalDays} days until ${newTrialEnd.toLocaleDateString()}. Enjoy full hiring features!`,
    link: '/recruiter/dashboard',
  });

  res.json({ success: true, message: `Free trial extended by ${additionalDays} days.`, subscription: user.subscription });
});

const changeUserSubscription = asyncHandler(async (req, res, next) => {
  const { planId, status = 'active', isTrial = false, durationDays = 30 } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return next(new ApiError(404, 'User not found.'));

  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) return next(new ApiError(404, 'Subscription plan not found.'));

  const now = new Date();
  const periodEnd = new Date(now.getTime() + Number(durationDays) * 24 * 60 * 60 * 1000);

  user.subscription = {
    plan: plan._id,
    planName: plan.name,
    status,
    isTrial: Boolean(isTrial),
    trialEndsAt: isTrial ? periodEnd : undefined,
    periodStart: now,
    periodEnd,
    autoRenew: false,
  };

  // Sync plan quotas to user credits
  user.credits = {
    jobPosts: plan.maxJobPosts === -1 ? 9999 : plan.maxJobPosts,
    featuredJobs: plan.featuredJobsIncluded,
    urgentJobs: plan.urgentJobsIncluded,
    profileViews: plan.candidateProfileViews,
    resumeDownloads: plan.resumeDownloads,
    contactCredits: plan.candidateContactCredits,
  };

  await user.save();
  res.json({ success: true, message: `Subscription changed to ${plan.name}.`, user: user.toSafeJSON() });
});

const listCompanies = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};
  if (req.query.verified !== undefined) filter.verified = req.query.verified === 'true';
  if (req.query.search) {
    filter.name = { $regex: req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  }

  const [companies, total] = await Promise.all([
    Company.find(filter).populate('owner', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Company.countDocuments(filter),
  ]);
  res.json({ success: true, companies, pagination: buildPagination(page, limit, total) });
});

const verifyCompany = asyncHandler(async (req, res, next) => {
  const company = await Company.findById(req.params.id);
  if (!company) return next(new ApiError(404, 'Company not found.'));
  company.verified = req.body.verified === undefined ? true : req.body.verified;
  company.verifiedAt = company.verified ? new Date() : null;
  await company.save();

  await Notification.create({
    user: company.owner,
    type: 'system',
    title: company.verified ? 'Company verified' : 'Company verification updated',
    message: `Your company "${company.name}" has been ${company.verified ? 'verified' : 'updated'}.`,
    link: '/recruiter/company',
  });

  res.json({ success: true, message: 'Company updated.', company });
});

const listJobs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};
  if (req.query.source) filter.source = req.query.source;
  if (req.query.isVerified !== undefined) filter.isVerified = req.query.isVerified === 'true';
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) {
    const term = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [{ jobTitle: { $regex: term, $options: 'i' } }, { companyName: { $regex: term, $options: 'i' } }];
  }

  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Job.countDocuments(filter),
  ]);
  res.json({ success: true, jobs, pagination: buildPagination(page, limit, total) });
});

const moderateJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  if (!job) return next(new ApiError(404, 'Job not found.'));

  if (req.body.isActive !== undefined) job.isActive = req.body.isActive;
  if (req.body.isVerified !== undefined) job.isVerified = req.body.isVerified;
  if (req.body.isActive === false) job.isExpired = true;
  if (req.body.trendingScore !== undefined) job.trendingScore = req.body.trendingScore;

  await job.save();
  res.json({ success: true, message: 'Job updated.', job });
});

const toggleFeaturedJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  if (!job) return next(new ApiError(404, 'Job not found.'));

  job.trendingScore = job.trendingScore > 0 ? 0 : 50;
  await job.save();
  res.json({ success: true, message: `Job ${job.trendingScore > 0 ? 'featured' : 'unfeatured'}.`, job });
});

const deleteJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  if (!job) return next(new ApiError(404, 'Job not found.'));
  job.isActive = false;
  job.isExpired = true;
  job.isVerified = false;
  await job.save();

  await Application.updateMany({ job: job._id }, { $set: { status: 'withdrawn' } });
  res.json({ success: true, message: 'Job removed from the platform.' });
});

const listReports = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const [reports, total] = await Promise.all([
    Report.find(filter)
      .populate('reportedBy', 'name email')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Report.countDocuments(filter),
  ]);
  res.json({ success: true, reports, pagination: buildPagination(page, limit, total) });
});

const resolveReport = asyncHandler(async (req, res, next) => {
  const report = await Report.findById(req.params.id);
  if (!report) return next(new ApiError(404, 'Report not found.'));
  report.status = req.body.action;
  report.resolution = req.body.resolution || '';
  report.resolvedBy = req.user._id;
  report.resolvedAt = new Date();
  await report.save();
  res.json({ success: true, message: 'Report resolved.', report });
});

const getAllAdminInfo = asyncHandler(async (req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalUsers, totalCandidates, totalRecruiters, totalAdmins,
    totalJobs, activeJobs, pendingJobs, expiredJobs,
    totalCompanies, verifiedCompanies,
    totalApplications, openReports,
    jobsToday, applicationsToday, usersToday,
    activeSubscriptions, trialUsers,
    monthlyRevenueAgg, totalRevenueAgg, couponStatsAgg,
    jobsByCategory, jobsBySource,
    recentUsers, recentJobs, recentCompanies, recentPayments,
    servicesList, plansList, couponsList, bundlesList,
    adminStaffList, systemSettings,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'candidate' }),
    User.countDocuments({ role: 'recruiter' }),
    User.countDocuments({ role: 'admin' }),
    Job.countDocuments(),
    Job.countDocuments({ isActive: true, isExpired: false }),
    Job.countDocuments({ isVerified: false, isExpired: false }),
    Job.countDocuments({ isExpired: true }),
    Company.countDocuments(),
    Company.countDocuments({ verified: true }),
    Application.countDocuments(),
    Report.countDocuments({ status: 'open' }),
    Job.countDocuments({ createdAt: { $gte: dayStart } }),
    Application.countDocuments({ createdAt: { $gte: dayStart } }),
    User.countDocuments({ createdAt: { $gte: dayStart } }),
    User.countDocuments({ 'subscription.status': 'active', 'subscription.isTrial': false }),
    User.countDocuments({ 'subscription.status': 'trial', 'subscription.isTrial': true }),
    Transaction.aggregate([
      { $match: { status: 'succeeded', createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Transaction.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Coupon.aggregate([
      { $group: { _id: null, totalUsed: { $sum: '$timesUsed' }, totalDiscount: { $sum: '$totalDiscountGiven' } } },
    ]),
    Job.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    Job.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),

    User.find().sort({ createdAt: -1 }).limit(15).select('name email role adminRole avatar status subscription credits createdAt').lean(),
    Job.find().sort({ createdAt: -1 }).limit(15).select('jobTitle companyName category workMode isVerified isActive isFeatured trendingScore postedDate createdAt').lean(),
    Company.find().sort({ createdAt: -1 }).limit(15).select('name slug logo verified website industry city country activeJobsCount createdAt').lean(),
    Transaction.find().sort({ createdAt: -1 }).limit(15).populate('user', 'name email role').lean(),
    Service.find().sort({ sortOrder: 1, createdAt: -1 }).lean(),
    SubscriptionPlan.find().sort({ sortOrder: 1, price: 1 }).lean(),
    Coupon.find().sort({ createdAt: -1 }).lean(),
    Bundle.find().sort({ sortOrder: 1, createdAt: -1 }).lean(),
    User.find({ role: 'admin' }).select('name email role adminRole permissions avatar createdAt').lean(),
    SystemSetting.find().lean(),
  ]);

  const monthlyRevenue = monthlyRevenueAgg[0]?.total || 0;
  const totalRevenue = totalRevenueAgg[0]?.total || 0;
  const couponStats = couponStatsAgg[0] || { totalUsed: 0, totalDiscount: 0 };

  res.json({
    success: true,
    data: {
      analytics: {
        totalUsers,
        totalCandidates,
        totalRecruiters,
        totalAdmins,
        totalJobs,
        activeJobs,
        pendingJobs,
        expiredJobs,
        totalCompanies,
        verifiedCompanies,
        totalApplications,
        openReports,
        today: {
          jobs: jobsToday,
          applications: applicationsToday,
          users: usersToday,
        },
        subscriptions: {
          active: activeSubscriptions,
          trial: trialUsers,
        },
        revenue: {
          monthly: monthlyRevenue,
          total: totalRevenue,
        },
        coupons: couponStats,
        jobsByCategory: Object.fromEntries(jobsByCategory.map((c) => [c._id || 'unknown', c.count])),
        jobsBySource: Object.fromEntries(jobsBySource.map((s) => [s._id || 'unknown', s.count])),
      },
      users: recentUsers,
      jobs: recentJobs,
      companies: recentCompanies,
      payments: {
        recent: recentPayments,
        totalRevenue,
        monthlyRevenue,
      },
      services: servicesList,
      plans: plansList,
      coupons: couponsList,
      bundles: bundlesList,
      adminRoles: adminStaffList,
      settings: systemSettings,
    },
  });
});

module.exports = {
  dashboard,
  getAllAdminInfo,
  listUsers,
  getUserDetails,
  updateUser,
  grantUserCredits,
  extendUserTrial,
  changeUserSubscription,
  listCompanies,
  verifyCompany,
  listJobs,
  moderateJob,
  toggleFeaturedJob,
  deleteJob,
  listReports,
  resolveReport,
};
