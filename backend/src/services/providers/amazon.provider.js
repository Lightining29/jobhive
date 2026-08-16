const { JobProvider, ProviderError } = require('./base.provider');
const env = require('../../config/env');
const { stripHtml } = require('../../utils/helpers');
const { extractSkills } = require('../../utils/skillExtractor');
const { classifyJob } = require('../../utils/jobClassifier');

const clean = (value) => (value === null || value === undefined ? '' : String(value).trim());

const COUNTRY_NAMES = {
  IND: 'India',
  USA: 'United States',
  GBR: 'United Kingdom',
  CAN: 'Canada',
  DEU: 'Germany',
  FRA: 'France',
  JPN: 'Japan',
  AUS: 'Australia',
  SGP: 'Singapore',
  ARE: 'United Arab Emirates',
  NLD: 'Netherlands',
  IRL: 'Ireland',
  ESP: 'Spain',
  POL: 'Poland',
  LUX: 'Luxembourg',
  MEX: 'Mexico',
  BRA: 'Brazil',
  KOR: 'South Korea',
  SWE: 'Sweden',
  CHE: 'Switzerland',
  ITA: 'Italy',
};

const mapEmployment = (schedule) => {
  const s = clean(schedule).toLowerCase();
  if (s.includes('part')) return 'part-time';
  if (s.includes('contract')) return 'contract';
  if (s.includes('intern')) return 'internship';
  return 'full-time';
};

const parseDate = (value) => {
  const t = clean(value);
  if (!t) return new Date();
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? new Date() : d;
};

class AmazonProvider extends JobProvider {
  constructor() {
    super('amazon', env.jobApis.amazon);
  }

  isEnabled() {
    return this.config.enabled;
  }

  async fetch() {
    if (!this.isEnabled()) return [];
    const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' };
    const urls = [
      'https://www.amazon.jobs/en/search.json?result_limit=100&sort=recent',
      'https://www.amazon.jobs/en/search.json?result_limit=100&loc_query=India&sort=recent',
    ];
    const seen = new Set();
    const all = [];
    const results = await Promise.allSettled(
      urls.map(async (url) => {
        const res = await fetch(url, { signal: AbortSignal.timeout(25000), headers });
        if (res.status === 429) throw new ProviderError('amazon rate limited', { retryable: true, status: 429 });
        if (!res.ok) throw new ProviderError(`amazon http ${res.status}`, { retryable: res.status >= 500 });
        const data = await res.json();
        return Array.isArray(data.jobs) ? data.jobs : [];
      })
    );
    for (const r of results) {
      if (r.status === 'fulfilled') {
        for (const job of r.value) {
          const id = clean(job.id) || clean(job.id_icims);
          if (!id || seen.has(id)) continue;
          seen.add(id);
          all.push(this.normalize(job));
        }
      }
    }
    return all.slice(0, 150);
  }

  normalize(raw) {
    const title = clean(raw.title);
    const description = stripHtml(clean(raw.description));
    const { category, subCategory } = classifyJob(title, description);
    const countryCode = clean(raw.country_code).toUpperCase();
    const location = clean(raw.normalized_location) || clean(raw.location) || raw.city;
    const link = clean(raw.job_path) ? `https://www.amazon.jobs${raw.job_path}` : '';
    const isIntern = Boolean(raw.is_intern);
    const isManager = Boolean(raw.is_manager);

    return {
      jobId: clean(raw.id) || clean(raw.id_icims),
      title,
      description,
      company: 'Amazon',
      logo: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=128',
      link,
      location,
      city: clean(raw.city),
      country: COUNTRY_NAMES[countryCode] || countryCode,
      employmentType: isIntern ? 'internship' : mapEmployment(raw.job_schedule_type),
      salaryMin: 0,
      salaryMax: 0,
      salary: 0,
      currency: 'USD',
      postedDate: parseDate(raw.posted_date),
      category,
      subCategory: clean(raw.job_category) || subCategory,
      requiredSkills: extractSkills(title, description, [clean(raw.job_category), clean(raw.business_category), clean(raw.team)].filter(Boolean), category),
      experienceLevel: isIntern ? 'internship' : isManager ? 'lead' : 'mid',
      workMode: location.toLowerCase().includes('remote') ? 'remote' : 'onsite',
      industry: clean(raw.business_category) || clean(raw.team),
    };
  }
}

module.exports = AmazonProvider;
