const { JobProvider, ProviderError } = require('./base.provider');
const env = require('../../config/env');
const { stripHtml } = require('../../utils/helpers');
const { extractSkills } = require('../../utils/skillExtractor');
const { classifyJob } = require('../../utils/jobClassifier');

const clean = (value) => (value === null || value === undefined ? '' : String(value).trim());

const mapEmployment = (types) => {
  const list = Array.isArray(types) ? types : [];
  const t = list.map((x) => clean(x).toLowerCase()).join(' ');
  if (t.includes('part')) return 'part-time';
  if (t.includes('contract')) return 'contract';
  if (t.includes('intern')) return 'internship';
  if (t.includes('temporary') || t.includes('temp')) return 'temporary';
  return 'full-time';
};

const mapExperience = (level) => {
  const s = clean(level).toLowerCase();
  if (s.includes('intern')) return 'internship';
  if (s.includes('entry') || s.includes('junior') || s.includes('graduate') || s.includes('fresher')) return 'fresher';
  if (s.includes('senior') || s.includes('principal')) return 'senior';
  if (s.includes('lead') || s.includes('director') || s.includes('head') || s.includes('manager')) return 'lead';
  return 'mid';
};

class JobicyProvider extends JobProvider {
  constructor() {
    super('jobicy', env.jobApis.jobicy);
  }

  isEnabled() {
    return this.config.enabled;
  }

  async fetch() {
    if (!this.isEnabled()) return [];
    const url = 'https://jobicy.com/api/v2/remote-jobs?count=50';
    const res = await fetch(url, { signal: AbortSignal.timeout(25000) });
    if (res.status === 429) throw new ProviderError('jobicy rate limited', { retryable: true, status: 429 });
    if (!res.ok) throw new ProviderError(`jobicy http ${res.status}`, { retryable: res.status >= 500 });
    const data = await res.json();
    const jobs = Array.isArray(data.jobs) ? data.jobs : [];
    return jobs.map((job) => this.normalize(job));
  }

  normalize(raw) {
    const title = clean(raw.jobTitle);
    const description = stripHtml(clean(raw.jobDescription) || clean(raw.jobExcerpt));
    const { category, subCategory } = classifyJob(title, description);
    const salaryMin = parseInt(raw.salaryMin, 10) || 0;
    const salaryMax = parseInt(raw.salaryMax, 10) || 0;
    const location = clean(raw.jobGeo) || 'Remote';
    const industries = Array.isArray(raw.jobIndustry) ? raw.jobIndustry.map((i) => clean(i)) : [];

    return {
      jobId: clean(raw.id) || clean(raw.jobSlug),
      title,
      description,
      company: clean(raw.companyName) || 'Remote Company',
      logo: clean(raw.companyLogo),
      link: clean(raw.url),
      location,
      city: '',
      country: location,
      employmentType: mapEmployment(raw.jobType),
      salaryMin,
      salaryMax,
      salary: salaryMax || salaryMin,
      currency: clean(raw.salaryCurrency) || 'USD',
      postedDate: raw.pubDate ? new Date(raw.pubDate) : new Date(),
      category,
      subCategory,
      requiredSkills: extractSkills(title, description, [...(raw.jobCategories || []), ...industries], category),
      experienceLevel: mapExperience(raw.jobLevel),
      workMode: 'remote',
      industry: industries[0] || '',
    };
  }
}

module.exports = JobicyProvider;
