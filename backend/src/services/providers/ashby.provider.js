const { JobProvider, ProviderError } = require('./base.provider');
const env = require('../../config/env');
const { stripHtml } = require('../../utils/helpers');
const { extractSkills } = require('../../utils/skillExtractor');
const { classifyJob } = require('../../utils/jobClassifier');

const clean = (value) => (value === null || value === undefined ? '' : String(value).trim());

const COMPANY_META = {
  notion: { name: 'Notion', domain: 'notion.so' },
  linear: { name: 'Linear', domain: 'linear.app' },
  figma: { name: 'Figma', domain: 'figma.com' },
  ramp: { name: 'Ramp', domain: 'ramp.com' },
  mercury: { name: 'Mercury', domain: 'mercury.com' },
  deel: { name: 'Deel', domain: 'deel.com' },
  zapier: { name: 'Zapier', domain: 'zapier.com' },
  buffer: { name: 'Buffer', domain: 'buffer.com' },
  helpscout: { name: 'Help Scout', domain: 'helpscout.com' },
  ghost: { name: 'Ghost', domain: 'ghost.org' },
  supabase: { name: 'Supabase', domain: 'supabase.com' },
  railway: { name: 'Railway', domain: 'railway.app' },
  render: { name: 'Render', domain: 'render.com' },
  tailwind: { name: 'Tailwind Labs', domain: 'tailwindcss.com' },
  mui: { name: 'MUI', domain: 'mui.com' },
  openai: { name: 'OpenAI', domain: 'openai.com' },
  anthropic: { name: 'Anthropic', domain: 'anthropic.com' },
  perplexity: { name: 'Perplexity AI', domain: 'perplexity.ai' },
  cursor: { name: 'Cursor / Anysphere', domain: 'cursor.com' },
  posthog: { name: 'PostHog', domain: 'posthog.com' },
  elevenlabs: { name: 'ElevenLabs', domain: 'elevenlabs.io' },
  together: { name: 'Together AI', domain: 'together.ai' },
  resend: { name: 'Resend', domain: 'resend.com' },
  vapi: { name: 'Vapi AI', domain: 'vapi.ai' },
  retool: { name: 'Retool', domain: 'retool.com' },
  loom: { name: 'Loom', domain: 'loom.com' },
  synthesia: { name: 'Synthesia', domain: 'synthesia.io' },
  runway: { name: 'Runway AI', domain: 'runwayml.com' },
  v0: { name: 'V0 / Vercel AI', domain: 'v0.dev' },
};

const mapEmployment = (type) => {
  const t = clean(type).toLowerCase();
  if (t.includes('part')) return 'part-time';
  if (t.includes('contract')) return 'contract';
  if (t.includes('intern')) return 'internship';
  if (t.includes('temporary')) return 'temporary';
  return 'full-time';
};

class AshbyProvider extends JobProvider {
  constructor() {
    super('ashby', env.jobApis.ashby);
  }

  isEnabled() {
    return this.config?.enabled !== false;
  }

  async fetch() {
    if (!this.isEnabled()) return [];
    const boards = Array.isArray(this.config.companies) && this.config.companies.length
      ? this.config.companies
      : Object.keys(COMPANY_META);

    const BATCH = 8;
    const all = [];
    for (let i = 0; i < boards.length; i += BATCH) {
      const batch = boards.slice(i, i + BATCH);
      const results = await Promise.allSettled(
        batch.map(async (board) => {
          const slug = clean(board);
          if (!slug) return [];
          const url = `https://api.ashbyhq.com/posting-api/job-board/${slug}?includeCompensation=true`;
          const res = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'Mozilla/5.0' } });
          if (res.status === 429) throw new ProviderError(`ashby:${slug} rate limited`, { retryable: true, status: 429 });
          if (!res.ok) return [];
          const data = await res.json();
          const jobs = Array.isArray(data.jobs) ? data.jobs : [];
          return jobs.filter((j) => j.isListed !== false).map((job) => this.normalize(job, slug));
        })
      );
      for (const r of results) {
        if (r.status === 'fulfilled') all.push(...r.value);
        else if (r.status === 'rejected' && r.reason?.retryable && r.reason?.status === 429) throw r.reason;
      }
    }
    return all;
  }

  normalize(raw, board) {
    const meta = COMPANY_META[board] || { name: board.charAt(0).toUpperCase() + board.slice(1), domain: `${board}.com` };
    const title = clean(raw.title);
    const description = stripHtml(clean(raw.descriptionHtml) || clean(raw.descriptionPlain));
    const { category, subCategory } = classifyJob(title, description);
    const location = clean(raw.location) || 'Remote';
    const workplace = clean(raw.workplaceType).toLowerCase();
    const workMode = workplace.includes('remote') ? 'remote' : workplace.includes('hybrid') ? 'hybrid' : 'onsite';
    const salaryMin = parseInt(raw.compensation && raw.compensation.minSalary, 10) || 0;
    const salaryMax = parseInt(raw.compensation && raw.compensation.maxSalary, 10) || 0;
    const currency = clean(raw.compensation && raw.compensation.currency) || 'USD';

    return {
      jobId: `ashby:${board}:${clean(raw.id)}`,
      title,
      description,
      company: meta.name,
      logo: meta.domain ? `https://www.google.com/s2/favicons?domain=${meta.domain}&sz=128` : '',
      link: clean(raw.jobUrl),
      location,
      city: clean(raw.address && raw.address.postalAddress && raw.address.postalAddress.addressLocality),
      country: clean(raw.address && raw.address.postalAddress && raw.address.postalAddress.addressCountry) || '',
      employmentType: mapEmployment(raw.employmentType),
      salaryMin,
      salaryMax,
      salary: salaryMax || salaryMin,
      currency,
      postedDate: raw.publishedAt ? new Date(raw.publishedAt) : new Date(),
      category,
      subCategory: clean(raw.department) || subCategory,
      requiredSkills: extractSkills(title, description).slice(0, 15),
      workMode,
      industry: clean(raw.team),
    };
  }
}

module.exports = AshbyProvider;
