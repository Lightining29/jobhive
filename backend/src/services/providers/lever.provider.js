const { JobProvider, ProviderError } = require('./base.provider');
const env = require('../../config/env');
const { stripHtml } = require('../../utils/helpers');
const { extractSkills } = require('../../utils/skillExtractor');
const { classifyJob } = require('../../utils/jobClassifier');

const clean = (value) => (value === null || value === undefined ? '' : String(value).trim());

const COMPANY_META = {
  netflix: { name: 'Netflix', domain: 'netflix.com' },
  spotify: { name: 'Spotify', domain: 'spotify.com' },
  yelp: { name: 'Yelp', domain: 'yelp.com' },
  atlassian: { name: 'Atlassian', domain: 'atlassian.com' },
  kraken: { name: 'Kraken', domain: 'kraken.com' },
  twitch: { name: 'Twitch', domain: 'twitch.tv' },
  coursera: { name: 'Coursera', domain: 'coursera.org' },
  automattic: { name: 'Automattic', domain: 'automattic.com' },
  eventbrite: { name: 'Eventbrite', domain: 'eventbrite.com' },
  plex: { name: 'Plex', domain: 'plex.tv' },
  postman: { name: 'Postman', domain: 'postman.com' },
  kinsta: { name: 'Kinsta', domain: 'kinsta.com' },
  brave: { name: 'Brave Software', domain: 'brave.com' },
  sourcegraph: { name: 'Sourcegraph', domain: 'sourcegraph.com' },
  retool: { name: 'Retool', domain: 'retool.com' },
  auth0: { name: 'Auth0', domain: 'auth0.com' },
  hashicorp: { name: 'HashiCorp', domain: 'hashicorp.com' },
  palantir: { name: 'Palantir', domain: 'palantir.com' },
  unity: { name: 'Unity', domain: 'unity.com' },
  inmobi: { name: 'InMobi', domain: 'inmobi.com' },
  cars24: { name: 'Cars24', domain: 'cars24.com' },
  shiprocket: { name: 'Shiprocket', domain: 'shiprocket.in' },
  nagarro: { name: 'Nagarro', domain: 'nagarro.com' },
  chegg: { name: 'Chegg', domain: 'chegg.com' },
  juspay: { name: 'Juspay', domain: 'juspay.in' },
  chargebee: { name: 'Chargebee', domain: 'chargebee.com' },
  freshworks: { name: 'Freshworks', domain: 'freshworks.com' },
  clevertap: { name: 'CleverTap', domain: 'clevertap.com' },
  moengage: { name: 'MoEngage', domain: 'moengage.com' },
  yellowai: { name: 'Yellow.ai', domain: 'yellow.ai' },
  gupshup: { name: 'Gupshup', domain: 'gupshup.io' },
  darwinbox: { name: 'Darwinbox', domain: 'darwinbox.com' },
  whatfix: { name: 'Whatfix', domain: 'whatfix.com' },
  wingify: { name: 'Wingify (VWO)', domain: 'wingify.com' },
  leadsquared: { name: 'LeadSquared', domain: 'leadsquared.com' },
  signeasy: { name: 'SignEasy', domain: 'signeasy.com' },
  exotel: { name: 'Exotel', domain: 'exotel.com' },
};

const mapWorkMode = (workplaceType, categories = {}) => {
  const text = clean(`${workplaceType} ${categories.location || ''} ${categories.commitment || ''}`).toLowerCase();
  if (text.includes('remote')) return 'remote';
  if (text.includes('hybrid')) return 'hybrid';
  return 'onsite';
};

const mapEmployment = (commitment) => {
  const c = clean(commitment).toLowerCase();
  if (c.includes('part')) return 'part-time';
  if (c.includes('contract') || c.includes('freelance')) return 'contract';
  if (c.includes('intern')) return 'internship';
  return 'full-time';
};

class LeverProvider extends JobProvider {
  constructor() {
    super('lever', env.jobApis.lever || { enabled: true });
  }

  isEnabled() {
    return this.config?.enabled !== false;
  }

  async fetch() {
    if (!this.isEnabled()) return [];
    const companies = Array.isArray(this.config.companies) && this.config.companies.length
      ? this.config.companies
      : Object.keys(COMPANY_META);

    const BATCH = 8;
    const all = [];

    for (let i = 0; i < companies.length; i += BATCH) {
      const batch = companies.slice(i, i + BATCH);
      const results = await Promise.allSettled(
        batch.map(async (companySlug) => {
          const slug = clean(companySlug).toLowerCase();
          if (!slug) return [];
          const url = `https://api.lever.co/v0/postings/${slug}?mode=json`;
          const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
          if (res.status === 429) {
            throw new ProviderError(`lever:${slug} rate limited`, { retryable: true, status: 429 });
          }
          if (!res.ok) return [];
          const jobs = await res.json();
          if (!Array.isArray(jobs)) return [];
          return jobs.map((job) => this.normalize(job, slug));
        })
      );

      for (const r of results) {
        if (r.status === 'fulfilled') all.push(...r.value);
        else if (r.status === 'rejected' && r.reason?.retryable && r.reason?.status === 429) throw r.reason;
      }
    }

    return all;
  }

  normalize(raw, slug) {
    const meta = COMPANY_META[slug] || { name: slug.toUpperCase(), domain: `${slug}.com` };
    const title = clean(raw.text);
    const description = stripHtml(clean(raw.descriptionPlain) || clean(raw.description));
    const { category, subCategory } = classifyJob(title, description);
    const location = clean(raw.categories && raw.categories.location) || 'Remote';
    const workMode = mapWorkMode(raw.workplaceType, raw.categories);
    const department = clean(raw.categories && (raw.categories.department || raw.categories.team));

    return {
      jobId: `lever:${slug}:${clean(raw.id)}`,
      title,
      description,
      company: meta.name,
      logo: meta.domain ? `https://www.google.com/s2/favicons?domain=${meta.domain}&sz=128` : '',
      link: clean(raw.hostedUrl) || clean(raw.applyUrl),
      location,
      city: '',
      country: location,
      employmentType: mapEmployment(raw.categories && raw.categories.commitment),
      salaryMin: 0,
      salaryMax: 0,
      salary: 0,
      currency: 'USD',
      postedDate: raw.createdAt ? new Date(raw.createdAt) : new Date(),
      category,
      subCategory: department || subCategory,
      requiredSkills: extractSkills(title, description, [department, ...(raw.categories && raw.categories.tags ? raw.categories.tags : [])].filter(Boolean), category),
      workMode,
      industry: department,
    };
  }
}

module.exports = LeverProvider;
