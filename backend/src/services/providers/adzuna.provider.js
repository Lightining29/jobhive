const { JobProvider, ProviderError } = require('./base.provider');
const env = require('../../config/env');
const { stripHtml } = require('../../utils/helpers');
const { extractSkills } = require('../../utils/skillExtractor');
const { classifyJob } = require('../../utils/jobClassifier');

const clean = (value) => (value === null || value === undefined ? '' : String(value).trim());

const COUNTRY_NAMES = { gb: 'UK', in: 'India', us: 'USA', de: 'Germany', ca: 'Canada', au: 'Australia' };
const CURRENCIES = { gb: 'GBP', in: 'INR', us: 'USD', de: 'EUR', ca: 'CAD', au: 'AUD' };

class AdzunaProvider extends JobProvider {
  constructor(countryOverride) {
    super('adzuna', {
      ...env.jobApis.adzuna,
      country: countryOverride || env.jobApis.adzuna.country,
    });
  }

  isEnabled() {
    return Boolean(this.config.enabled && this.config.appId && this.config.appKey);
  }

  async fetch() {
    if (!this.isEnabled()) return [];
    const params = new URLSearchParams({
      app_id: this.config.appId,
      app_key: this.config.appKey,
      results_per_page: '50',
      'content-type': 'application/json',
    });
    const url = `${this.config.baseUrl}/${this.config.country}/search/1?${params}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (res.status === 429) throw new ProviderError('adzuna rate limited', { retryable: true, status: 429 });
    if (!res.ok) throw new ProviderError(`adzuna http ${res.status}`, { retryable: res.status >= 500 });
    const data = await res.json();
    const jobs = Array.isArray(data.results) ? data.results : [];
    return jobs.map((job) => this.normalize(job));
  }

  normalize(raw) {
    const title = clean(raw.title);
    const locObj = raw.location || {};
    const area = Array.isArray(locObj.area) ? locObj.area.map((a) => clean(a)).filter(Boolean) : [];
    const displayName = clean(locObj.display_name);
    const isGeneric = !displayName || (area.length > 0 && area.includes(displayName)) || displayName.toLowerCase() === (area[0] || '').toLowerCase();
    const location = isGeneric ? area.slice(1).join(', ') || (area[0] || '') : displayName;
    const contractType = clean(raw.contract_type);
    const category = clean(raw.category && raw.category.label);
    const fullDesc = `${title} ${clean(raw.description)} ${category}`;
    const { category: jobCategory, subCategory } = classifyJob(title, clean(raw.description));

    const workMode = fullDesc.toLowerCase().includes('remote') ? 'remote' : fullDesc.toLowerCase().includes('hybrid') ? 'hybrid' : 'onsite';
    const salaryMin = Number(raw.salary_min) || 0;
    const salaryMax = Number(raw.salary_max) || 0;
    const salary = salaryMax || salaryMin || 0;
    const currency = CURRENCIES[this.config.country] || this.config.country.toUpperCase();
    const countryName = COUNTRY_NAMES[this.config.country] || this.config.country.toUpperCase();

    return {
      jobId: `${this.config.country}:${clean(raw.id)}`,
      title,
      description: stripHtml(clean(raw.description)),
      company: clean(raw.company && raw.company.display_name),
      logo: '',
      link: clean(raw.redirect_url),
      location,
      country: countryName,
      employmentType: contractType || 'full-time',
      salaryMin,
      salaryMax,
      salary,
      currency,
      postedDate: new Date(raw.created),
      category: jobCategory,
      subCategory,
      requiredSkills: extractSkills(title, clean(raw.description), [clean(raw.category && raw.category.label), clean(raw.category && raw.category.tag)].filter(Boolean), jobCategory),
      workMode,
    };
  }
}

module.exports = AdzunaProvider;
