const { JobProvider, ProviderError } = require('./base.provider');
const env = require('../../config/env');
const { stripHtml } = require('../../utils/helpers');
const { extractSkills } = require('../../utils/skillExtractor');
const { classifyJob } = require('../../utils/jobClassifier');

const clean = (value) => (value === null || value === undefined ? '' : String(value).trim());

class ArbeitnowProvider extends JobProvider {
  constructor() {
    super('arbeitnow', env.jobApis.arbeitnow);
  }

  isEnabled() {
    return this.config.enabled;
  }

  async fetch() {
    if (!this.isEnabled()) return [];
    const url = 'https://www.arbeitnow.com/api/job-board-api';
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (res.status === 429) throw new ProviderError('arbeitnow rate limited', { retryable: true, status: 429 });
    if (!res.ok) throw new ProviderError(`arbeitnow http ${res.status}`, { retryable: res.status >= 500 });
    const data = await res.json();
    const jobs = Array.isArray(data.data) ? data.data : [];
    return jobs.slice(0, 150).map((job) => this.normalize(job));
  }

  normalize(raw) {
    const title = clean(raw.title);
    const description = stripHtml(clean(raw.description));
    const { category, subCategory } = classifyJob(title, description);
    const tags = Array.isArray(raw.tags) ? raw.tags.map((t) => clean(t)) : [];
    const skills = extractSkills(title, description, tags, category);
    const workMode = title.toLowerCase().includes('remote') || String(raw.remote || '').toLowerCase() === 'true' ? 'remote' : title.toLowerCase().includes('hybrid') ? 'hybrid' : 'onsite';
    const location = clean(raw.location);
    const city = clean(raw.city);
    const country = clean(raw.country) || 'Germany';

    return {
      jobId: clean(raw.slug),
      title,
      description,
      company: clean(raw.company_name),
      logo: '',
      link: clean(raw.url),
      location,
      city: city || location,
      country,
      employmentType: clean(raw.employment_type) || 'full-time',
      salaryMin: 0,
      salaryMax: 0,
      salary: 0,
      currency: 'EUR',
      postedDate: new Date(raw.created_at),
      category,
      subCategory,
      requiredSkills: skills,
      workMode,
    };
  }
}

module.exports = ArbeitnowProvider;
