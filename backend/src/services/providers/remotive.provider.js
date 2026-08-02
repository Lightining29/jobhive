const { JobProvider, ProviderError } = require('./base.provider');
const env = require('../../config/env');
const { stripHtml } = require('../../utils/helpers');
const { extractSkills } = require('../../utils/skillExtractor');
const { classifyJob } = require('../../utils/jobClassifier');

const clean = (value) => (value === null || value === undefined ? '' : String(value).trim());

class RemotiveProvider extends JobProvider {
  constructor() {
    super('remotive', env.jobApis.remotive);
  }

  isEnabled() {
    return this.config.enabled;
  }

  async fetch() {
    if (!this.isEnabled()) return [];
    const url = 'https://remotive.com/api/remote-jobs?limit=100';
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (res.status === 429) throw new ProviderError('remotive rate limited', { retryable: true, status: 429 });
    if (!res.ok) throw new ProviderError(`remotive http ${res.status}`, { retryable: res.status >= 500 });
    const data = await res.json();
    const jobs = Array.isArray(data.jobs) ? data.jobs : [];
    return jobs.map((job) => this.normalize(job));
  }

  normalize(raw) {
    const title = clean(raw.title);
    const description = stripHtml(clean(raw.description) || clean(raw.content));
    const { category, subCategory } = classifyJob(title, description);
    const jobType = clean(raw.job_type).toLowerCase();
    const employmentType = ['full-time', 'part-time', 'contract', 'internship', 'temporary'].includes(jobType) ? jobType : 'full-time';
    const salary = raw.salary ? parseInt(clean(raw.salary).replace(/[^0-9]/g, ''), 10) || 0 : 0;

    return {
      jobId: clean(raw.id),
      title,
      description,
      company: clean(raw.company_name),
      logo: '',
      link: clean(raw.url),
      location: 'Remote',
      city: '',
      country: clean(raw.candidate_required_location) || 'Remote',
      employmentType,
      salaryMin: salary,
      salaryMax: salary,
      salary,
      currency: 'USD',
      postedDate: new Date(raw.publication_date),
      category,
      subCategory,
      requiredSkills: extractSkills(title, description),
      workMode: 'remote',
    };
  }
}

module.exports = RemotiveProvider;
