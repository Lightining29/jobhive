const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const cloudinary = require('../services/cloudinary.service');
const { slugify } = require('../utils/helpers');
const { classifyJob } = require('../utils/jobClassifier');
const { extractSkills } = require('../utils/skillExtractor');
const { paginate, buildPagination } = require('../utils/query');
const fs = require('fs');

const requireCompany = async (req) => {
  let company = await Company.findOne({ owner: req.user._id });
  if (!company) {
    const compName = (req.body?.companyName || req.user.companyName || `${req.user.name}'s Organization`).trim();
    company = await Company.create({
      name: compName,
      slug: slugify(compName) + '-' + Date.now().toString(36),
      owner: req.user._id,
      city: req.body?.city || '',
      country: req.body?.country || 'India',
      verified: false,
    });
    req.user.company = company._id;
    await req.user.save();
  }
  return company;
};

const registerCompany = asyncHandler(async (req, res, next) => {
  const existing = await Company.findOne({ name: new RegExp(`^${req.body.name}$`, 'i') });
  if (existing) return next(new ApiError(409, 'A company with this name already exists.'));

  const company = await Company.create({
    ...req.body,
    slug: slugify(req.body.name),
    owner: req.user._id,
  });

  req.user.company = company._id;
  await req.user.save();

  res.status(201).json({ success: true, message: 'Company registered. It is pending verification.', company });
});

const getMyCompany = asyncHandler(async (req, res) => {
  const company = await requireCompany(req);
  res.json({ success: true, company });
});

const updateCompany = asyncHandler(async (req, res) => {
  const company = await requireCompany(req);
  const allowed = ['name', 'website', 'description', 'industry', 'size', 'foundedYear', 'headquarters', 'country', 'city', 'email', 'phone', 'socialLinks'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) company[field] = req.body[field];
  });
  company.slug = slugify(company.name);
  await company.save();
  res.json({ success: true, message: 'Company updated.', company });
});

const uploadLogo = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new ApiError(400, 'No image uploaded.'));
  const company = await requireCompany(req);
  let localPath = null;
  try {
    let logo;
    if (cloudinary.isConfigured()) {
      logo = await cloudinary.uploadImage({ filePath: req.file.path });
    } else {
      logo = { url: `/uploads/${req.file.filename}`, publicId: '' };
      localPath = req.file.path;
    }
    if (company.logo && company.logo.publicId) {
      await cloudinary.removeByPublicId(company.logo.publicId);
    }
    company.logo = { url: logo.url, publicId: logo.publicId || '' };
    await company.save();
    res.json({ success: true, message: 'Logo uploaded.', company });
  } finally {
    if (cloudinary.isConfigured() && localPath === null) {
      fs.promises.unlink(req.file.path).catch(() => {});
    }
  }
});

const postJob = asyncHandler(async (req, res, next) => {
  const company = await requireCompany(req);
  const { category, subCategory } = classifyJob(req.body.jobTitle, req.body.description);
  const requiredSkills = req.body.requiredSkills && req.body.requiredSkills.length
    ? req.body.requiredSkills.map((s) => s.toLowerCase().trim()).filter(Boolean)
    : extractSkills(req.body.jobTitle, req.body.description, [], category);

  const job = await Job.create({
    ...req.body,
    jobId: `recruiter:${Date.now()}:${req.user._id}`,
    source: 'recruiter',
    companyName: company.name,
    companyLogo: company.logo ? company.logo.url : '',
    companyWebsite: company.website || '',
    companyId: company._id,
    postedBy: req.user._id,
    requiredSkills,
    category: req.body.category || category,
    subCategory: req.body.subCategory || subCategory,
    experience: {
      min: req.body.experienceMin ?? 0,
      max: req.body.experienceMax ?? 0,
    },
    salary: req.body.salaryMax || req.body.salaryMin || 0,
    salaryMin: req.body.salaryMin || 0,
    salaryMax: req.body.salaryMax || 0,
    remote: req.body.workMode === 'remote',
    hybrid: req.body.workMode === 'hybrid',
    onsite: req.body.workMode === 'onsite' || !req.body.workMode,
    isVerified: false,
    expiresAt: new Date(Date.now() + (req.body.expiresInDays || 30) * 24 * 60 * 60 * 1000),
  });

  res.status(201).json({ success: true, message: 'Job posted. It is pending verification.', job });
});

const updateJob = asyncHandler(async (req, res, next) => {
  const company = await requireCompany(req);
  const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
  if (!job) return next(new ApiError(404, 'Job not found.'));

  const allowed = ['jobTitle', 'description', 'requiredSkills', 'experienceMin', 'experienceMax', 'experienceLevel', 'salaryMin', 'salaryMax', 'currency', 'salaryPeriod', 'employmentType', 'location', 'city', 'state', 'country', 'workMode', 'industry', 'applicationUrl', 'applicationEmail', 'isActive'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) job[field] = req.body[field];
  });

  if (req.body.jobTitle || req.body.description) {
    const { category, subCategory } = classifyJob(job.jobTitle, job.description);
    job.category = category;
    job.subCategory = subCategory;
  }
  if (req.body.experienceMin !== undefined || req.body.experienceMax !== undefined) {
    job.experience = {
      min: req.body.experienceMin ?? job.experience?.min ?? 0,
      max: req.body.experienceMax ?? job.experience?.max ?? 0,
    };
  }
  job.remote = job.workMode === 'remote';
  job.hybrid = job.workMode === 'hybrid';
  job.onsite = job.workMode === 'onsite' || !job.workMode;
  job.salary = job.salaryMax || job.salaryMin || 0;
  await job.save();

  res.json({ success: true, message: 'Job updated.', job });
});

const deleteJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
  if (!job) return next(new ApiError(404, 'Job not found.'));
  job.isActive = false;
  job.isExpired = true;
  await job.save();
  res.json({ success: true, message: 'Job deactivated.' });
});

const myJobs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = { postedBy: req.user._id };
  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Job.countDocuments(filter),
  ]);
  res.json({ success: true, jobs, pagination: buildPagination(page, limit, total) });
});

const applicationsForMyJobs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = { postedBy: req.user._id };
  const jobs = await Job.find(filter).select('_id').lean();
  const jobIds = jobs.map((j) => j._id);
  const appFilter = { job: { $in: jobIds } };
  if (req.query.status) appFilter.status = req.query.status;

  const [applications, total] = await Promise.all([
    Application.find(appFilter)
      .populate('job', 'jobTitle companyName location workMode salaryMax currency')
      .populate('candidate', 'name email avatar phone headline resume skills')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Application.countDocuments(appFilter),
  ]);

  res.json({ success: true, applications, pagination: buildPagination(page, limit, total) });
});

const updateApplicationStatus = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id).populate('job', 'postedBy jobTitle');
  if (!application) return next(new ApiError(404, 'Application not found.'));
  if (!application.job || application.job.postedBy.toString() !== req.user._id.toString()) {
    return next(new ApiError(403, 'Not authorized for this application.'));
  }

  application.status = req.body.status;
  await application.save();

  await Notification.create({
    user: application.candidate,
    type: 'application',
    title: `Application ${application.status}`,
    message: `Your application for "${application.job.jobTitle}" was ${application.status}.`,
    link: '/candidate/applications',
  });

  res.json({ success: true, message: `Application ${application.status}.`, application });
});

const scheduleInterview = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id).populate('job', 'postedBy jobTitle companyName');
  if (!application) return next(new ApiError(404, 'Application not found.'));
  if (!application.job || application.job.postedBy.toString() !== req.user._id.toString()) {
    return next(new ApiError(403, 'Not authorized for this application.'));
  }

  application.interview = {
    scheduled: true,
    date: req.body.date,
    mode: req.body.mode,
    link: req.body.link || '',
    notes: req.body.notes || '',
  };
  application.status = 'interview';
  await application.save();

  await Notification.create({
    user: application.candidate,
    type: 'interview',
    title: 'Interview scheduled',
    message: `Interview for "${application.job.jobTitle}" on ${new Date(req.body.date).toLocaleString()} (${req.body.mode}).`,
    link: '/candidate/applications',
  });

  res.json({ success: true, message: 'Interview scheduled.', application });
});

const dashboard = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ owner: req.user._id });
  const jobFilter = { postedBy: req.user._id };
  const jobs = await Job.find(jobFilter).select('_id').lean();
  const jobIds = jobs.map((j) => j._id);

  const [totalJobs, activeJobs, applicants, interviews, recentApplications, applicationsByStatus] = await Promise.all([
    Job.countDocuments(jobFilter),
    Job.countDocuments({ ...jobFilter, isActive: true, isExpired: false }),
    Application.countDocuments({ job: { $in: jobIds } }),
    Application.countDocuments({ job: { $in: jobIds }, 'interview.scheduled': true }),
    Application.find({ job: { $in: jobIds } })
      .populate('job', 'jobTitle companyName location')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  res.json({
    success: true,
    company,
    stats: {
      totalJobs,
      activeJobs,
      applicants,
      interviews,
      applicationsByStatus: Object.fromEntries(applicationsByStatus.map((a) => [a._id, a.count])),
    },
    recentApplications,
  });
});

module.exports = {
  registerCompany,
  getMyCompany,
  updateCompany,
  uploadLogo,
  postJob,
  updateJob,
  deleteJob,
  myJobs,
  applicationsForMyJobs,
  updateApplicationStatus,
  scheduleInterview,
  dashboard,
};
