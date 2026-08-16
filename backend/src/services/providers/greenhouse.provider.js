const { JobProvider, ProviderError } = require('./base.provider');
const env = require('../../config/env');
const { stripHtml } = require('../../utils/helpers');
const { extractSkills } = require('../../utils/skillExtractor');
const { classifyJob } = require('../../utils/jobClassifier');

const clean = (value) => (value === null || value === undefined ? '' : String(value).trim());

const COMPANY_META = {
  airbnb: { name: 'Airbnb', domain: 'airbnb.com' },
  reddit: { name: 'Reddit', domain: 'reddit.com' },
  instacart: { name: 'Instacart', domain: 'instacart.com' },
  duolingo: { name: 'Duolingo', domain: 'duolingo.com' },
  stripe: { name: 'Stripe', domain: 'stripe.com' },
  dropbox: { name: 'Dropbox', domain: 'dropbox.com' },
  coinbase: { name: 'Coinbase', domain: 'coinbase.com' },
  datadog: { name: 'Datadog', domain: 'datadoghq.com' },
  mongodb: { name: 'MongoDB', domain: 'mongodb.com' },
  cloudflare: { name: 'Cloudflare', domain: 'cloudflare.com' },
  databricks: { name: 'Databricks', domain: 'databricks.com' },
  roblox: { name: 'Roblox', domain: 'roblox.com' },
  intercom: { name: 'Intercom', domain: 'intercom.com' },
  airtable: { name: 'Airtable', domain: 'airtable.com' },
  squarespace: { name: 'Squarespace', domain: 'squarespace.com' },
  spotify: { name: 'Spotify', domain: 'spotify.com' },
  square: { name: 'Block / Square', domain: 'squareup.com' },
  tcs: { name: 'TCS', domain: 'tcs.com' },
  spacex: { name: 'SpaceX', domain: 'spacex.com' },
  phonepe: { name: 'PhonePe', domain: 'phonepe.com' },
  groww: { name: 'Groww', domain: 'groww.in' },
  paytm: { name: 'Paytm', domain: 'paytm.com' },
  infoedge: { name: 'Info Edge (Naukri)', domain: 'infoedge.in' },
  zomato: { name: 'Zomato', domain: 'zomato.com' },
  blinkit: { name: 'Blinkit', domain: 'blinkit.com' },
  delhivery: { name: 'Delhivery', domain: 'delhivery.com' },
  policybazaar: { name: 'Policybazaar', domain: 'policybazaar.com' },
  makemytrip: { name: 'MakeMyTrip', domain: 'makemytrip.com' },
  urbancompany: { name: 'Urban Company', domain: 'urbancompany.com' },
  moglix: { name: 'Moglix', domain: 'moglix.com' },
  indiamart: { name: 'IndiaMART', domain: 'indiamart.com' },
  physicswallah: { name: 'PhysicsWallah', domain: 'pw.live' },
  classplus: { name: 'Classplus', domain: 'classplus.co' },
  lenskart: { name: 'Lenskart', domain: 'lenskart.com' },
  sprinklr: { name: 'Sprinklr', domain: 'sprinklr.com' },
  cvent: { name: 'Cvent', domain: 'cvent.com' },
  swiggy: { name: 'Swiggy', domain: 'swiggy.com' },
  cred: { name: 'CRED', domain: 'cred.club' },
  meesho: { name: 'Meesho', domain: 'meesho.com' },
  razorpay: { name: 'Razorpay', domain: 'razorpay.com' },
  cleartax: { name: 'ClearTax', domain: 'cleartax.in' },
  browserstack: { name: 'BrowserStack', domain: 'browserstack.com' },
  dream11: { name: 'Dream11', domain: 'dream11.com' },
  upstox: { name: 'Upstox', domain: 'upstox.com' },
  zepto: { name: 'Zepto', domain: 'zeptonow.com' },
  spinny: { name: 'Spinny', domain: 'spinny.com' },
  pristyncare: { name: 'Pristyn Care', domain: 'pristyncare.com' },
  inshorts: { name: 'Inshorts', domain: 'inshorts.com' },
  leenaai: { name: 'Leena AI', domain: 'leena.ai' },
  scaler: { name: 'Scaler', domain: 'scaler.com' },
  unacademy: { name: 'Unacademy', domain: 'unacademy.com' },
  simpl: { name: 'Simpl', domain: 'getsimpl.com' },
  khatabook: { name: 'Khatabook', domain: 'khatabook.com' },
  shadowfax: { name: 'Shadowfax', domain: 'shadowfax.in' },
  porter: { name: 'Porter', domain: 'porter.in' },
  headout: { name: 'Headout', domain: 'headout.com' },
  practo: { name: 'Practo', domain: 'practo.com' },
  nagarro: { name: 'Nagarro', domain: 'nagarro.com' },
  thoughtworks: { name: 'ThoughtWorks', domain: 'thoughtworks.com' },
  newgen: { name: 'Newgen Software', domain: 'newgensoft.com' },
  coforge: { name: 'Coforge', domain: 'coforge.com' },
  birlasoft: { name: 'Birlasoft', domain: 'birlasoft.com' },
  persistent: { name: 'Persistent Systems', domain: 'persistent.com' },
  twilio: { name: 'Twilio', domain: 'twilio.com' },
  gitlab: { name: 'GitLab', domain: 'gitlab.com' },
  figma: { name: 'Figma', domain: 'figma.com' },
  brex: { name: 'Brex', domain: 'brex.com' },
  mercury: { name: 'Mercury', domain: 'mercury.com' },
  elastic: { name: 'Elastic', domain: 'elastic.co' },
  epicgames: { name: 'Epic Games', domain: 'epicgames.com' },
  riotgames: { name: 'Riot Games', domain: 'riotgames.com' },
  pinterest: { name: 'Pinterest', domain: 'pinterest.com' },
  vercel: { name: 'Vercel', domain: 'vercel.com' },
  newrelic: { name: 'New Relic', domain: 'newrelic.com' },
  smartsheet: { name: 'SmartSheet', domain: 'smartsheet.com' },
  asana: { name: 'Asana', domain: 'asana.com' },
  canva: { name: 'Canva', domain: 'canva.com' },
  doordash: { name: 'DoorDash', domain: 'doordash.com' },
  affirm: { name: 'Affirm', domain: 'affirm.com' },
  snowflake: { name: 'Snowflake', domain: 'snowflake.com' },
  scaleai: { name: 'Scale AI', domain: 'scale.com' },
  rippling: { name: 'Rippling', domain: 'rippling.com' },
  hubspot: { name: 'HubSpot', domain: 'hubspot.com' },
  gusto: { name: 'Gusto', domain: 'gusto.com' },
  github: { name: 'GitHub', domain: 'github.com' },
  discord: { name: 'Discord', domain: 'discord.com' },
  uber: { name: 'Uber', domain: 'uber.com' },
  robinhood: { name: 'Robinhood', domain: 'robinhood.com' },
  plaid: { name: 'Plaid', domain: 'plaid.com' },
  grammarly: { name: 'Grammarly', domain: 'grammarly.com' },
  lucid: { name: 'Lucid Software', domain: 'lucid.co' },
  dbtlabs: { name: 'dbt Labs', domain: 'getdbt.com' },
};

const inferWorkMode = (location, office) => {
  const text = clean(`${location} ${office}`).toLowerCase();
  if (text.includes('remote')) return 'remote';
  if (text.includes('hybrid')) return 'hybrid';
  return 'onsite';
};

class GreenhouseProvider extends JobProvider {
  constructor() {
    super('greenhouse', env.jobApis.greenhouse);
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
          const url = `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`;
          const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
          if (res.status === 429) {
            throw new ProviderError(`greenhouse:${slug} rate limited`, { retryable: true, status: 429 });
          }
          if (!res.ok) {
            if (res.status === 404) return [];
            throw new ProviderError(`greenhouse:${slug} http ${res.status}`, { retryable: res.status >= 500 });
          }
          const data = await res.json();
          const jobs = Array.isArray(data.jobs) ? data.jobs : [];
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

  normalize(raw, board) {
    const meta = COMPANY_META[board] || { name: board.charAt(0).toUpperCase() + board.slice(1), domain: `${board}.com` };
    const title = clean(raw.title);
    const description = stripHtml(clean(raw.content));
    const { category, subCategory } = classifyJob(title, description);
    const location = clean(raw.location && raw.location.name);
    const office = clean(raw.offices && raw.offices[0] && raw.offices[0].name);
    const department = clean(raw.departments && raw.departments[0] && raw.departments[0].name);

    return {
      jobId: `greenhouse:${board}:${clean(raw.id)}`,
      title,
      description,
      company: meta.name,
      logo: meta.domain ? `https://www.google.com/s2/favicons?domain=${meta.domain}&sz=128` : '',
      link: clean(raw.absolute_url),
      location: location || office || meta.name,
      city: '',
      country: location || '',
      employmentType: 'full-time',
      salaryMin: 0,
      salaryMax: 0,
      salary: 0,
      currency: 'USD',
      postedDate: raw.first_published ? new Date(raw.first_published) : new Date(raw.updated_at || Date.now()),
      category,
      subCategory: department || subCategory,
      requiredSkills: extractSkills(title, description, [department].filter(Boolean), category),
      workMode: inferWorkMode(location, office),
      industry: department,
    };
  }
}

module.exports = GreenhouseProvider;
