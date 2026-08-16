const { JobProvider, ProviderError } = require('./base.provider');
const env = require('../../config/env');
const { stripHtml } = require('../../utils/helpers');
const { extractSkills } = require('../../utils/skillExtractor');
const { classifyJob } = require('../../utils/jobClassifier');

const clean = (value) => (value === null || value === undefined ? '' : String(value).trim());

const mapEmployment = (type) => {
  const t = clean(type).toLowerCase();
  if (t.includes('part')) return 'part-time';
  if (t.includes('contract')) return 'contract';
  if (t.includes('intern')) return 'internship';
  if (t.includes('temporary') || t.includes('temp')) return 'temporary';
  return 'full-time';
};

const mapExperience = (seniority) => {
  const s = clean(seniority).toLowerCase();
  if (s.includes('intern')) return 'internship';
  if (s.includes('entry') || s.includes('junior') || s.includes('graduate')) return 'fresher';
  if (s.includes('senior') || s.includes('principal')) return 'senior';
  if (s.includes('lead') || s.includes('director') || s.includes('head') || s.includes('vp') || s.includes('manager')) return 'lead';
  return 'mid';
};

class HimalayasProvider extends JobProvider {
  constructor() {
    super('himalayas', env.jobApis.himalayas);
  }

  isEnabled() {
    return this.config.enabled;
  }

  async fetch() {
    if (!this.isEnabled()) return [];
    const url = 'https://himalayas.app/jobs/api';
    const res = await fetch(url, { signal: AbortSignal.timeout(25000) });
    if (res.status === 429) throw new ProviderError('himalayas rate limited', { retryable: true, status: 429 });
    if (!res.ok) throw new ProviderError(`himalayas http ${res.status}`, { retryable: res.status >= 500 });
    const data = await res.json();
    const jobs = Array.isArray(data) ? data : Array.isArray(data.jobs) ? data.jobs : [];
    return jobs.slice(0, 20).map((job) => this.normalize(job));
  }

  normalize(raw) {
    const title = clean(raw.title);
    const description = stripHtml(clean(raw.description));
    const { category, subCategory } = classifyJob(title, description);
    const skills = clean(raw.categories)
      .split(/\s+/)
      .filter(Boolean)
      .map((s) => s.replace(/-/g, ' ').toLowerCase());
    const location = clean(raw.locationRestrictions) || 'Remote';
    const salaryMin = parseInt(raw.minSalary, 10) || 0;
    const salaryMax = parseInt(raw.maxSalary, 10) || 0;
    const companyName = clean(raw.companyName) === 'name' ? clean(raw.companySlug) || clean(raw.companyName) : clean(raw.companyName);
    const logo = clean(raw.companyLogo) === 'thumbnail_url' ? '' : clean(raw.companyLogo);

    return {
      jobId: clean(raw.guid),
      title,
      description,
      company: companyName || clean(raw.companySlug) || 'Remote Company',
      logo,
      link: clean(raw.applicationLink),
      location,
      city: '',
      country: location,
      employmentType: mapEmployment(raw.employmentType),
      salaryMin,
      salaryMax,
      salary: salaryMax || salaryMin,
      currency: clean(raw.currency) || 'USD',
      postedDate: new Date((raw.pubDate || Math.floor(Date.now() / 1000)) * 1000),
      category,
      subCategory,
      requiredSkills: extractSkills(title, description, skills, category),
      experienceLevel: mapExperience(raw.seniority),
      workMode: 'remote',
    };
  }
}

module.exports = HimalayasProvider;
