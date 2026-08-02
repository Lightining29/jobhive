const { JobProvider, ProviderError } = require('./base.provider');
const env = require('../../config/env');
const { stripHtml } = require('../../utils/helpers');
const { extractSkills } = require('../../utils/skillExtractor');
const { classifyJob } = require('../../utils/jobClassifier');

const clean = (value) => (value === null || value === undefined ? '' : String(value).trim());

class JoobleProvider extends JobProvider {
  constructor() {
    super('jooble', env.jobApis.jooble);
  }

  isEnabled() {
    return Boolean(this.config.enabled && this.config.key);
  }

  async fetch() {
    if (!this.isEnabled()) return [];
    const url = `${this.config.baseUrl}/${this.config.key}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: 'software OR developer OR engineer OR marketing OR sales', location: '' }),
      signal: AbortSignal.timeout(20000),
    });
    if (res.status === 429) throw new ProviderError('jooble rate limited', { retryable: true, status: 429 });
    if (!res.ok) throw new ProviderError(`jooble http ${res.status}`, { retryable: res.status >= 500 });
    const data = await res.json();
    const jobs = Array.isArray(data.jobs) ? data.jobs : [];
    return jobs.slice(0, 100).map((job) => this.normalize(job));
  }

  normalize(raw) {
    const title = clean(raw.title);
    const location = clean(raw.location);
    const salaryRaw = clean(raw.salary) || '';
    const salary = parseInt(salaryRaw.replace(/[^0-9]/g, ''), 10) || 0;
    const snippet = `${clean(raw.title)} ${clean(raw.snippet)} ${clean(raw.type)}`.toLowerCase();
    const { category, subCategory } = classifyJob(clean(raw.title), clean(raw.snippet));
    const workMode = snippet.includes('remote') ? 'remote' : snippet.includes('hybrid') ? 'hybrid' : 'onsite';

    return {
      jobId: clean(raw.id) || Buffer.from(clean(raw.link) || title).toString('hex').slice(0, 32),
      title,
      description: stripHtml(clean(raw.snippet)),
      company: clean(raw.company),
      logo: clean(raw.updated) && clean(raw.updated).startsWith('http') ? clean(raw.updated) : '',
      link: clean(raw.link),
      location,
      country: this.extractCountry(location),
      employmentType: snippet.includes('part-time') ? 'part-time' : snippet.includes('contract') ? 'contract' : snippet.includes('internship') ? 'internship' : 'full-time',
      salary,
      currency: 'USD',
      postedDate: new Date(),
      category,
      subCategory,
      requiredSkills: extractSkills(clean(raw.title), clean(raw.snippet)),
      workMode,
    };
  }

  extractCountry(location = '') {
    const l = location.toLowerCase();
    const map = { uk: 'UK', usa: 'USA', 'united states': 'USA', canada: 'Canada', germany: 'Germany', india: 'India', australia: 'Australia', france: 'France', 'netherlands': 'Netherlands' };
    for (const [k, v] of Object.entries(map)) {
      if (l.includes(k)) return v;
    }
    const parts = location.split(',');
    return parts.length > 1 ? clean(parts[parts.length - 1]) : clean(location);
  }
}

module.exports = JoobleProvider;
