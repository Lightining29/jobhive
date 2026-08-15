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

const CAREER_PAGE_SOURCES = ['greenhouse', 'ashby', 'lever', 'amazon', 'recruiter'];

function rankAndPrioritizeJobs(jobs, user = null) {
  return jobs
    .map((job) => {
      let priorityScore = 0;
      // 1. Direct Career Page jobs (Greenhouse, Ashby, Lever, Amazon, Recruiter) get highest priority
      if (CAREER_PAGE_SOURCES.includes(job.source)) {
        priorityScore += 100;
      }
      // 2. Software & Technical roles get top priority
      if (
        job.category === 'technical' ||
        /(developer|engineer|software|fullstack|frontend|backend|java|python|react|node|cloud|devops|architect|qa|sdet)/i.test(
          job.jobTitle || ''
        )
      ) {
        priorityScore += 60;
      }
      // 3. Featured / verified bonus
      if (job.isFeatured) priorityScore += 40;
      if (job.isVerified) priorityScore += 20;

      const match = user ? computeMatchScore(user, job) : 0;
      return { ...job, match, _priorityScore: priorityScore + (match || 0) };
    })
    .sort((a, b) => b._priorityScore - a._priorityScore);
}

async function searchJobs(params, user = null) {
  let filter = buildFilters(params);
  const sort = sortOptions(params.sort);

  const { page, limit, skip } = paginate({ page: params.page || 1, limit: params.limit || 10 });

  let baseQuery = Job.find(filter);
  if (filter.$text) {
    baseQuery.select({ score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });
  } else {
    baseQuery.sort(sort);
  }

  let [jobs, total] = await Promise.all([
    baseQuery.skip(skip).limit(limit * 2).lean(),
    Job.countDocuments(filter),
  ]);

  let isBroadened = false;

  // If 0 results found, try searching by individual headline/title/skill terms across all locations
  if (total === 0) {
    const rawSearch = (params.search || params.q || '').trim();
    const searchTerms = rawSearch.split(/\s+/).filter((w) => w.length > 1);

    if (searchTerms.length > 0) {
      const termFilters = searchTerms.map((t) => {
        const esc = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return {
          $or: [
            { headline: { $regex: esc, $options: 'i' } },
            { jobTitle: { $regex: esc, $options: 'i' } },
            { requiredSkills: { $regex: esc, $options: 'i' } },
            { companyName: { $regex: esc, $options: 'i' } },
          ],
        };
      });

      const headlineFilter = {
        isActive: true,
        isExpired: false,
        $or: termFilters,
      };

      const [hJobs, hTotal] = await Promise.all([
        Job.find(headlineFilter).sort({ postedDate: -1, createdAt: -1 }).limit(limit * 2).lean(),
        Job.countDocuments(headlineFilter),
      ]);

      if (hTotal > 0) {
        jobs = hJobs;
        total = hTotal;
        isBroadened = true;
      }
    }
  }

  // If 0 results found for a specific city/location, broaden search across Remote + All locations
  if (total === 0 && (params.city || params.location)) {
    const broadenedParams = { ...params, city: undefined, location: undefined, state: undefined };
    const broadenedFilter = buildFilters(broadenedParams);
    const broadenedQuery = Job.find(broadenedFilter);
    if (broadenedFilter.$text) {
      broadenedQuery.select({ score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });
    } else {
      broadenedQuery.sort(sort);
    }

    const [bJobs, bTotal] = await Promise.all([
      broadenedQuery.skip(skip).limit(limit * 2).lean(),
      Job.countDocuments(broadenedFilter),
    ]);

    if (bTotal > 0) {
      jobs = bJobs;
      total = bTotal;
      isBroadened = true;
    }
  }

  // If still 0 results, fall back to top active available roles
  if (total === 0) {
    const fallbackJobs = await Job.find({
      isActive: true,
      isExpired: false,
    })
      .sort({ postedDate: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    if (fallbackJobs.length > 0) {
      jobs = fallbackJobs;
      total = fallbackJobs.length;
      isBroadened = true;
    }
  }

  // Rank Career Pages first, then APIs, prioritizing Software roles
  const ranked = rankAndPrioritizeJobs(jobs, user).slice(0, limit);

  return {
    jobs: ranked,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    isBroadened,
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
