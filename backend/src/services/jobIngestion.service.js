const Job = require('../models/Job');
const JobLog = require('../models/JobLog');
const logger = require('../config/logger');
const { getProviders } = require('./providers');
const { cleanUrl } = require('../utils/helpers');

const clean = (value) => (value === null || value === undefined ? '' : String(value).trim());

const mapEmploymentType = (value) => {
  const v = clean(value).toLowerCase();
  if (v.includes('full')) return 'full-time';
  if (v.includes('part')) return 'part-time';
  if (v.includes('contract')) return 'contract';
  if (v.includes('intern')) return 'internship';
  if (v.includes('temp')) return 'temporary';
  return 'full-time';
};

const mapExperienceLevel = (job) => {
  const title = clean(job.title).toLowerCase();
  const desc = clean(job.description).toLowerCase();
  if (job.experienceLevel) return job.experienceLevel;
  if (title.includes('intern') || title.includes('internship')) return 'internship';
  if (title.includes('senior') || title.includes('lead') || title.includes('principal') || title.includes('staff') || title.includes('manager')) return 'senior';
  if (desc.includes('fresher') || desc.includes('entry level') || desc.includes('0-2 years') || desc.includes('0 - 2 years') || desc.includes('fresh graduate')) return 'fresher';
  if (title.includes('junior')) return 'junior';
  if (title.includes('mid')) return 'mid';
  return 'mid';
};

const inferExperienceRange = (job, level) => {
  if (job.experienceMin !== undefined && job.experienceMax !== undefined) {
    return { min: job.experienceMin, max: job.experienceMax };
  }
  const map = {
    internship: { min: 0, max: 1 },
    fresher: { min: 0, max: 2 },
    junior: { min: 1, max: 3 },
    mid: { min: 3, max: 6 },
    senior: { min: 5, max: 10 },
    lead: { min: 8, max: 15 },
    '': { min: 0, max: 8 },
  };
  return map[level] || { min: 0, max: 5 };
};

const splitLocation = (job) => {
  const location = clean(job.location);
  const parts = location.split(',').map((p) => clean(p)).filter(Boolean);
  let city = clean(job.city) || parts[0] || '';
  let country = clean(job.country) || (parts.length > 1 ? parts[parts.length - 1] : '');
  let state = '';
  if (parts.length >= 3) {
    city = parts[0];
    state = parts[1];
    country = parts[2];
  } else if (parts.length === 2 && city === parts[0]) {
    const second = parts[1];
    const knownCountries = ['usa', 'uk', 'united states', 'india', 'canada', 'germany', 'australia', 'france', 'spain', 'netherlands', 'brazil', 'remote', 'worldwide'];
    if (knownCountries.includes(second.toLowerCase())) country = second;
    else state = second;
  }
  return { location, city, state, country };
};

const buildJobDoc = (providerName, normalized) => {
  const level = mapExperienceLevel(normalized);
  const exp = inferExperienceRange(normalized, level);
  const loc = splitLocation(normalized);
  const employmentType = mapEmploymentType(normalized.employmentType);
  const workMode = ['remote', 'hybrid', 'onsite'].includes(normalized.workMode) ? normalized.workMode : 'onsite';
  const salary = Number(normalized.salary) || 0;
  const salaryMin = Number(normalized.salaryMin) || salary || 0;
  const salaryMax = Number(normalized.salaryMax) || salary || 0;
  const companyName = clean(normalized.company) || 'Unknown Company';

  const postedDate = normalized.postedDate instanceof Date && !Number.isNaN(normalized.postedDate)
    ? normalized.postedDate
    : new Date();

  const expiresAt = new Date(postedDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    jobId: normalized.jobId ? `${providerName}:${normalized.jobId}` : `${providerName}:${companyName}:${clean(normalized.title)}`,
    source: providerName,
    companyName,
    companyLogo: clean(normalized.logo) || '',
    companyWebsite: clean(normalized.companyWebsite) || '',
    jobTitle: clean(normalized.title).slice(0, 150),
    description: clean(normalized.description).slice(0, 20000),
    requiredSkills: Array.from(new Set((normalized.requiredSkills || []).map((s) => clean(s).toLowerCase()).filter(Boolean))).slice(0, 15),
    category: normalized.category || 'technical',
    subCategory: normalized.subCategory || '',
    experience: exp,
    experienceLevel: level,
    salary,
    salaryMin,
    salaryMax,
    currency: clean(normalized.currency) || 'USD',
    salaryPeriod: 'yearly',
    employmentType,
    location: loc.location,
    city: loc.city.slice(0, 100),
    state: loc.state.slice(0, 100),
    country: loc.country.slice(0, 100),
    workMode,
    remote: workMode === 'remote',
    hybrid: workMode === 'hybrid',
    onsite: workMode === 'onsite',
    industry: clean(normalized.industry) || clean(normalized.subCategory),
    postedDate,
    expiresAt,
    applicationUrl: cleanUrl(normalized.link),
    isActive: true,
    isVerified: true,
    isExpired: false,
    raw: normalized,
  };
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchFromProvider = async (provider) => {
  if (!provider.isEnabled()) {
    logger.debug(`[jobs] provider ${provider.name} disabled`);
    return 0;
  }
  const MAX_ATTEMPTS = 3;
  let attempt = 0;
  for (;;) {
    attempt += 1;
    try {
      const jobs = await provider.fetch();
      const docs = jobs.map((normalized) => buildJobDoc(provider.name, normalized));
      const ops = docs.map((doc) => ({
        updateOne: {
          filter: { jobId: doc.jobId },
          update: { $set: { ...doc, isActive: true, isExpired: false } },
          upsert: true,
        },
      }));
      if (ops.length > 0) {
        const result = await Job.bulkWrite(ops, { ordered: false });
        logger.info(`[jobs] ${provider.name}: fetched ${jobs.length}, upserted ${result.upsertedCount}`);
        return result.upsertedCount;
      }
      logger.info(`[jobs] ${provider.name}: fetched ${jobs.length}, saved 0`);
      return 0;
    } catch (err) {
      const retryable = err.retryable !== false && err.status !== 401 && err.status !== 403;
      logger.warn(`[jobs] ${provider.name} attempt ${attempt} failed: ${err.message}`);
      if (attempt >= MAX_ATTEMPTS || !retryable) {
        await JobLog.create({
          provider: provider.name,
          type: err.status === 429 ? 'rate-limit' : 'failure',
          message: err.message,
          meta: { attempt },
        });
        throw err;
      }
      await sleep(attempt * 3000);
    }
  }
};

const fetchAllJobs = async () => {
  const providers = getProviders();
  const settled = await Promise.allSettled(
    providers.map(async (provider) => {
      const saved = await fetchFromProvider(provider);
      return { provider: provider.name, status: 'ok', saved };
    })
  );
  return settled.map((r) =>
    r.status === 'fulfilled' ? r.value : { provider: 'unknown', status: 'failed', message: r.reason?.message }
  );
};

const cleanupExpiredJobs = async () => {
  const now = new Date();
  const expired = await Job.find({
    source: { $ne: 'recruiter' },
    isExpired: false,
    expiresAt: { $lt: now },
  }).select('_id');

  if (expired.length) {
    await Job.updateMany(
      { _id: { $in: expired.map((j) => j._id) } },
      { $set: { isExpired: true, isActive: false } }
    );
    logger.info(`[jobs] marked ${expired.length} expired`);
  }
  await JobLog.create({
    provider: 'cron',
    type: 'expire',
    message: `Marked ${expired.length} jobs expired`,
  });
  return expired.length;
};

module.exports = { fetchAllJobs, fetchFromProvider, cleanupExpiredJobs, buildJobDoc, getProviders };
