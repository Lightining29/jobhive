const crypto = require('crypto');

const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const formatCurrency = (amount, currency = 'USD') => {
  if (!amount) return 'Not specified';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

const isValidUrl = (value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .trim();

const stripHtml = (html) =>
  String(html || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/^[A-Z]{2,5}\d{3,8}[A-Z]?\d*\s*/i, '')
    .replace(/^(?:req|jb|jr|jid|position\s*id|job\s*id|requisition)\s*[:#]?\s*\d+\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();

const truncate = (text, length = 200) => {
  const clean = stripHtml(text);
  return clean.length > length ? `${clean.slice(0, length)}...` : clean;
};

const cleanUrl = (url) => {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
};

const buildLiveCompanyCareerUrl = (company, title, location, fallbackUrl) => {
  const comp = String(company || '').toLowerCase().trim();
  const t = encodeURIComponent(title || '');

  if (comp.includes('google')) {
    return `https://www.google.com/about/careers/applications/jobs/results/?q=${t}&location=India`;
  }
  if (comp.includes('apple')) {
    return `https://jobs.apple.com/en-in/search?search=${t}&location=india-INDC`;
  }
  if (comp.includes('microsoft')) {
    return `https://jobs.careers.microsoft.com/global/en/search?q=${t}&lc=India`;
  }
  if (comp.includes('amazon')) {
    return `https://www.amazon.jobs/en/search?base_query=${t}&loc_query=India`;
  }
  if (comp.includes('meta')) {
    return `https://www.metacareers.com/jobs?q=${t}`;
  }
  if (comp.includes('netflix')) {
    return `https://jobs.netflix.com/search?q=${t}`;
  }
  if (comp.includes('uber')) {
    return `https://www.uber.com/global/en/careers/list/?query=${t}&location=India`;
  }
  if (comp.includes('adobe')) {
    return `https://careers.adobe.com/us/en/search-results?keywords=${t}&location=India`;
  }
  if (comp.includes('nvidia')) {
    return `https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite?q=${t}`;
  }
  if (comp.includes('salesforce')) {
    return `https://careers.salesforce.com/en/jobs/?search=${t}&country=India`;
  }
  if (comp.includes('cisco')) {
    return `https://jobs.cisco.com/jobs/SearchJobs/${t}`;
  }
  if (comp.includes('intel')) {
    return `https://jobs.intel.com/en/search-jobs/${t}/India`;
  }
  if (comp.includes('oracle')) {
    return `https://careers.oracle.com/jobs/#en/sites/jobsearch/requisitions?keyword=${t}`;
  }
  if (comp.includes('ibm')) {
    return `https://www.ibm.com/careers/search?q=${t}`;
  }
  if (comp.includes('atlassian')) {
    return `https://www.atlassian.com/company/careers/all-jobs?search=${t}`;
  }
  if (comp.includes('spotify')) {
    return `https://www.lifeatspotify.com/jobs?q=${t}`;
  }
  if (comp.includes('swiggy')) {
    return `https://careers.swiggy.com/#/careers?search=${t}`;
  }
  if (comp.includes('zomato') || comp.includes('blinkit')) {
    return `https://www.zomato.com/careers`;
  }
  if (comp.includes('flipkart')) {
    return `https://www.flipkartcareers.com/#!/searchjobs?keyword=${t}`;
  }
  if (comp.includes('paytm')) {
    return `https://jobs.lever.co/paytm`;
  }
  if (comp.includes('phonepe')) {
    return `https://boards.greenhouse.io/phonepe`;
  }
  if (comp.includes('meesho')) {
    return `https://boards.greenhouse.io/meesho`;
  }
  if (comp.includes('cred')) {
    return `https://jobs.lever.co/cred`;
  }
  if (comp.includes('razorpay')) {
    return `https://jobs.lever.co/razorpay`;
  }
  if (comp.includes('groww')) {
    return `https://jobs.ashbyhq.com/groww`;
  }
  if (comp.includes('zepto')) {
    return `https://jobs.ashbyhq.com/zepto`;
  }
  if (comp.includes('urban company')) {
    return `https://boards.greenhouse.io/urbancompany`;
  }
  if (comp.includes('delhivery')) {
    return `https://boards.greenhouse.io/delhivery`;
  }
  if (comp.includes('lenskart')) {
    return `https://boards.greenhouse.io/lenskart`;
  }
  if (comp.includes('physicswallah')) {
    return `https://pw.live/careers`;
  }
  if (comp.includes('nykaa')) {
    return `https://www.nykaa.com/careers`;
  }
  if (comp.includes('zerodha')) {
    return `https://zerodha.com/careers`;
  }

  const clean = cleanUrl(fallbackUrl);
  // Avoid expired numeric IDs
  if (clean && !clean.includes('/details/200') && !clean.includes('/results/12') && !clean.includes('/results/13')) {
    return clean;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(`${company || 'Tech Company'} careers ${title || 'Software Engineer'} India apply`)}`;
};

module.exports = {
  randomToken,
  hashToken,
  formatCurrency,
  isValidUrl,
  slugify,
  normalizeText,
  stripHtml,
  truncate,
  cleanUrl,
  buildLiveCompanyCareerUrl,
};
