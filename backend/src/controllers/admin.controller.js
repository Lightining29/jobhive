const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, buildPagination, parseArray } = require('../utils/query');
void parseArray;

const dashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const dayStart = new Date(now.setHours(0, 0, 0, 0));

  const [
    users, candidates, recruiters, companies, jobs, applications,
    openReports, jobsToday, applicationsToday, usersToday,
    jobsByCategory, jobsBySource, applicationsByStatus,
    recentUsers, recentJobs, recentReports,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'candidate' }),
    User.countDocuments({ role: 'recruiter' }),
    Company.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments(),
    Report.countDocuments({ status: 'open' }),
    Job.countDocuments({ createdAt: { $gte: dayStart } }),
    Application.countDocuments({ createdAt: { $gte: dayStart } }),
    User.countDocuments({ createdAt: { $gte: dayStart } }),
    Job.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    Job.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),
    Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    User.find().sort({ createdAt: -1 }).limit(6).select('name email role avatar status createdAt').lean(),
    Job.find().sort({ createdAt: -1 }).limit(6).select('jobTitle companyName category isVerified isActive createdAt').lean(),
    Report.find({ status: 'open' }).sort({ createdAt: -1 }).limit(6).populate('reportedBy', 'name email').lean(),
  ]);

  res.json({
    success: true,
    stats: {
      users,
      candidates,
      recruiters,
      companies,
      jobs,
      applications,
      openReports,
      jobsToday,
      applicationsToday,
      usersToday,
      jobsByCategory: Object.fromEntries(jobsByCategory.map((j) => [j._id, j.count])),
      jobsBySource: Object.fromEntries(jobsBySource.map((j) => [j._id, j.count])),
      applicationsByStatus: Object.fromEntries(applicationsByStatus.map((a) => [a._id, a.count])),
    },
    recentUsers,
    recentJobs,
    recentReports,
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    const term = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [{ name: { $regex: term, $options: 'i' } }, { email: { $regex: term, $options: 'i' } }];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-password'),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, users, pagination: buildPagination(page, limit, total) });
});

const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ApiError(404, 'User not found.'));
  if (user.role === 'admin' && req.body.status === 'suspended') {
    return next(new ApiError(400, 'Cannot suspend another admin.'));
  }
  if (req.body.status) user.status = req.body.status;
  await user.save();
  res.json({ success: true, message: 'User updated.', user: user.toSafeJSON() });
});

const listCompanies = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};
  if (req.query.verified !== undefined) filter.verified = req.query.verified === 'true';
  if (req.query.search) {
    filter.name = { $regex: req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  }

  const [companies, total] = await Promise.all([
    Company.find(filter).populate('owner', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
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
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Job.countDocuments(filter),
  ]);
  res.json({ success: true, jobs, pagination: buildPagination(page, limit, total) });
});

const moderateJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  if (!job) return next(new ApiError(404, 'Job not found.'));

  if (req.body.isActive !== undefined) job.isActive = req.body.isActive;
  if (req.body.isVerified !== undefined) {
    job.isVerified = req.body.isVerified;
  }
  if (req.body.isActive === false) job.isExpired = true;
  await job.save();
  res.json({ success: true, message: 'Job updated.', job });
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
      .limit(limit),
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

module.exports = {
  dashboard,
  listUsers,
  updateUser,
  listCompanies,
  verifyCompany,
  listJobs,
  moderateJob,
  deleteJob,
  listReports,
  resolveReport,
};
