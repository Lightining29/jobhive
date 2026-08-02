const Job = require('../../models/Job');
const Company = require('../../models/Company');
const { computeMatchScore } = require('../aiRecommendation.service');
const { formatCurrency } = require('../../utils/helpers');

const baseJobFilter = () => ({
  isActive: true,
  isExpired: false,
  postedDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
});

const indiaScopeFilter = () => ({
  $or: [
    { remote: true },
    { country: { $regex: 'india', $options: 'i' } },
    { location: { $regex: 'india', $options: 'i' } },
  ],
});

async function searchJobs(params, user = null) {
  const filter = baseJobFilter();

  if (params.search) {
    const escaped = params.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$text = { $search: escaped };
  }

  if (params.skills) {
    const skills = params.skills.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (skills.length) {
      filter.$or = [
        { requiredSkills: { $in: skills } },
        { jobTitle: { $regex: skills.join('|'), $options: 'i' } },
      ];
    }
  }

  if (params.workMode) filter.workMode = params.workMode;
  if (params.employmentType) filter.employmentType = params.employmentType;
  if (params.experienceLevel) filter.experienceLevel = params.experienceLevel;
  if (params.category) filter.category = params.category;
  if (params.company) filter.companyName = { $regex: new RegExp(params.company, 'i') };
  if (params.city) filter.city = new RegExp(params.city, 'i');
  if (params.state) filter.state = new RegExp(params.state, 'i');
  if (params.country) filter.country = new RegExp(params.country, 'i');
  if (params.source) filter.source = params.source;

  if (params.remote === 'true' || params.remote === true) {
    filter.workMode = 'remote';
  }

  if (params.internship === 'true' || params.employmentType === 'internship') {
    filter.employmentType = 'internship';
  }

  if (params.fresher === 'true') {
    filter.experienceLevel = { $in: ['fresher', 'internship'] };
  }

  if (params.experience) {
    const raw = String(params.experience).trim().toLowerCase();
    const LEVELS = ['internship', 'fresher', 'junior', 'mid', 'senior', 'lead'];
    if (LEVELS.includes(raw)) {
      filter.experienceLevel = raw;
    } else {
      const exp = Number(raw);
      if (Number.isFinite(exp) && exp >= 0) {
        filter.experienceLevel = exp <= 1 ? 'internship' : exp <= 2 ? 'fresher' : exp <= 4 ? 'junior' : exp <= 7 ? 'mid' : 'senior';
      }
    }
  }

  if (params.salaryMin) {
    const min = Number(params.salaryMin);
    if (Number.isFinite(min) && min > 0) filter.salaryMax = { $gte: min };
  }
  if (params.salaryMax) {
    const max = Number(params.salaryMax);
    if (Number.isFinite(max) && max > 0) {
      filter.$and = [...(filter.$and || []), { salaryMin: { $lte: max } }];
    }
  }

  if (params.postedWithinDays) {
    const days = Number(params.postedWithinDays);
    if (Number.isFinite(days) && days > 0) {
      filter.postedDate = { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
    }
  }

  const hasExplicitGeo = params.city || params.state || params.country;
  if (!hasExplicitGeo && params.scope !== 'global') {
    filter.$and = [...(filter.$and || []), indiaScopeFilter()];
  }

  const sortMap = {
    salary: { salaryMax: -1, salaryMin: -1 },
    newest: { postedDate: -1 },
    trending: { trendingScore: -1, postedDate: -1 },
    oldest: { postedDate: 1 },
    relevance: { postedDate: -1 },
  };
  const sort = sortMap[params.sort] || sortMap.newest;

  const limit = Math.min(parseInt(params.limit, 10) || 10, 25);
  const page = Math.max(parseInt(params.page, 10) || 1, 1);
  const skip = (page - 1) * limit;

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
  const filter = baseJobFilter();
  const hasExplicitGeo = params.city || params.state || params.country;
  if (!hasExplicitGeo && params.scope !== 'global') {
    filter.$and = [indiaScopeFilter()];
  }

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
