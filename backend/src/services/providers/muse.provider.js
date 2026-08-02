const { JobProvider, ProviderError } = require('./base.provider');
const env = require('../../config/env');
const { stripHtml } = require('../../utils/helpers');
const { extractSkills } = require('../../utils/skillExtractor');
const { classifyJob } = require('../../utils/jobClassifier');

const clean = (value) => (value === null || value === undefined ? '' : String(value).trim());

class MuseProvider extends JobProvider {
  constructor() {
    super('muse', env.jobApis.muse);
  }

  isEnabled() {
    return this.config.enabled;
  }

  async fetch() {
    if (!this.isEnabled()) return [];
    const url = 'https://www.themuse.com/api/public/jobs?page=1&location=Anywhere';
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (res.status === 429) throw new ProviderError('muse rate limited', { retryable: true, status: 429 });
    if (!res.ok) throw new ProviderError(`muse http ${res.status}`, { retryable: res.status >= 500 });
    const data = await res.json();
    const jobs = Array.isArray(data.results) ? data.results : [];
    return jobs.map((job) => this.normalize(job));
  }

  normalize(raw) {
    const title = clean(raw.name);
    const description = stripHtml(clean(raw.contents));
    const { category, subCategory } = classifyJob(title, description);
    const levels = Array.isArray(raw.levels) ? raw.levels.map((l) => clean(l.name).toLowerCase()) : [];
    const experienceLevel = levels.includes('internship')
      ? 'internship'
      : levels.includes('entry level')
        ? 'fresher'
        : levels.includes('senior level')
          ? 'senior'
          : 'mid';

    const city = clean(raw.locations && raw.locations[0] && raw.locations[0].name);
    const location = clean(raw.locations && raw.locations[0] && raw.locations[0].name);
    const company = clean(raw.company && raw.company.name);
    const logo = raw.company && raw.company.logo ? `https://www.themuse.com/logo?s=${clean(raw.company.logo)}` : '';
    const salary = raw.salary ? parseInt(clean(raw.salary).replace(/[^0-9]/g, ''), 10) || 0 : 0;

    return {
      jobId: clean(raw.id),
      title,
      description,
      company,
      logo,
      link: clean(raw.refs && raw.refs.landing_page),
      location,
      city,
      country: '',
      employmentType: 'full-time',
      salaryMin: salary,
      salaryMax: salary,
      salary,
      currency: 'USD',
      postedDate: raw.publication_date ? new Date(raw.publication_date) : new Date(),
      category,
      subCategory,
      requiredSkills: extractSkills(title, description),
      experienceLevel,
      workMode: String(raw.location || '').toLowerCase().includes('remote') ? 'remote' : 'onsite',
    };
  }
}

module.exports = MuseProvider;
