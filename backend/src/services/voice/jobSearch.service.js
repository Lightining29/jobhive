const Job = require('../../models/Job');
const Company = require('../../models/Company');
const { computeMatchScore } = require('../aiRecommendation.service');
const { formatCurrency } = require('../../utils/helpers');
const {
  buildFilters,
  sortOptions,
  baseJobFilter,
  indiaScopeFilter,
} = require('../../controllers/jobs.controller');
const { paginate } = require('../../utils/query');

async function searchJobs(params, user = null) {
  const filter = buildFilters(params);
  const sort = sortOptions(params.sort);

  const { page, limit, skip } = paginate({ page: params.page || 1, limit: params.limit || 10 });

  const baseQuery = Job.find(filter);
  if (params.search) {
    baseQuery.select({ score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });
  } else {
    baseQuery.sort(sort);
  }

  const [jobs, total] = await Promise.all([
    baseQuery.skip(skip).limit(limit).lean(),
    Job.countDocuments(filter),
  ]);

  const scored = user
    ? jobs.map((job) => ({ ...job, match: computeMatchScore(user, job) }))
    : jobs;

  return {
    jobs: scored,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

async function getJobDetails(jobId) {
  const job = await Job.findOne({ _id: jobId, isActive: true, isExpired: false }).lean();
  if (!job) return null;
  return {
    ...job,
    formattedSalary: formatCurrency(job.salaryMax || job.salary, job.currency),
  };
}

async function getCompanyInfo(companyId) {
  const company = await Company.findById(companyId).lean();
  if (!company) {
    const bySlug = await Company.findOne({ slug: companyId }).lean();
    return bySlug || null;
  }
  return company;
}

async function getCompanyByName(name) {
  return Company.findOne({
    name: { $regex: new RegExp(name, 'i') },
    verified: true,
  }).lean();
}

async function getJobStats(params = {}) {
  const filter = buildFilters(params);

  const [total, remote, hybrid, onsite, internships, fullTime, partTime] = await Promise.all([
    Job.countDocuments(filter),
    Job.countDocuments({ ...filter, workMode: 'remote' }),
    Job.countDocuments({ ...filter, workMode: 'hybrid' }),
    Job.countDocuments({ ...filter, workMode: 'onsite' }),
    Job.countDocuments({ ...filter, employmentType: 'internship' }),
    Job.countDocuments({ ...filter, employmentType: 'full-time' }),
    Job.countDocuments({ ...filter, employmentType: 'part-time' }),
  ]);

  const salaryAgg = await Job.aggregate([
    { $match: { ...filter, salaryMax: { $gt: 0 } } },
    {
      $group: {
        _id: null,
        avgSalary: { $avg: '$salaryMax' },
        minSalary: { $min: '$salaryMin' },
        maxSalary: { $max: '$salaryMax' },
        medianSalary: { $push: '$salaryMax' },
      },
    },
  ]);

  const salaryStats = salaryAgg[0] || {};
  if (salaryStats.medianSalary && salaryStats.medianSalary.length) {
    const sorted = salaryStats.medianSalary.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    salaryStats.medianSalary = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return {
    total,
    remote,
    hybrid,
    onsite,
    internships,
    fullTime,
    partTime,
    salary: salaryStats,
  };
}

module.exports = {
  searchJobs,
  getJobDetails,
  getCompanyInfo,
  getCompanyByName,
  getJobStats,
};
