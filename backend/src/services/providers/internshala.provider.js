const { JobProvider, ProviderError } = require('./base.provider');
const env = require('../../config/env');
const { stripHtml } = require('../../utils/helpers');
const { extractSkills } = require('../../utils/skillExtractor');
const { classifyJob } = require('../../utils/jobClassifier');

const clean = (value) => (value === null || value === undefined ? '' : String(value).trim());

const MAX_PAGES = 10;

const parseSalary = (text) => {
  const t = clean(text).replace(/[₹,$]/g, '').replace(/\s+/g, ' ');
  const nums = t.match(/[\d,]+/g);
  if (!nums || nums.length === 0) return { salaryMin: 0, salaryMax: 0, currency: 'INR' };
  const parse = (s) => parseInt(s.replace(/,/g, ''), 10) || 0;
  if (nums.length >= 2) return { salaryMin: parse(nums[0]), salaryMax: parse(nums[1]), currency: 'INR' };
  return { salaryMin: parse(nums[0]), salaryMax: parse(nums[0]), currency: 'INR' };
};

const extractCompanyFromUrl = (url) => {
  const m = url.match(/-at-([a-z0-9-]+?)(\d{8,})?$/i);
  if (!m) return '';
  return m[1]
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const mapExperience = (text) => {
  const s = clean(text).toLowerCase();
  if (s.includes('fresher') || s.includes('no experience')) return 'fresher';
  if (s.includes('intern')) return 'internship';
  if (s.includes('senior') || s.includes('5+')) return 'senior';
  if (s.includes('lead') || s.includes('manager')) return 'lead';
  return 'mid';
};

class InternshalaProvider extends JobProvider {
  constructor() {
    super('internshala', env.jobApis.internshala);
  }

  isEnabled() {
    return this.config && this.config.enabled;
  }

  async fetch() {
    if (!this.isEnabled()) return [];
    const urls = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      urls.push(page === 1 ? 'https://internshala.com/jobs' : `https://internshala.com/jobs/page-${page}`);
    }
    const BATCH = 5;
    const all = [];
    for (let i = 0; i < urls.length; i += BATCH) {
      const batch = urls.slice(i, i + BATCH);
      const results = await Promise.allSettled(
        batch.map(async (url) => {
          const res = await fetch(url, {
            signal: AbortSignal.timeout(20000),
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          });
          if (!res.ok) return [];
          const html = await res.text();
          return this.parseListPage(html);
        })
      );
      let stop = false;
      for (const r of results) {
        if (r.status === 'fulfilled') {
          if (r.value.length === 0) stop = true;
          else all.push(...r.value);
        }
      }
      if (stop) break;
    }
    return all;
  }

  parseListPage(html) {
    const results = [];
    const cardRegex = /<div[^>]*class="individual_internship_details[^"]*"[^>]*>([\s\S]*?)(?=<div[^>]*class="individual_internship_details|<div[^>]*id="header")/g;
    let match;

    while ((match = cardRegex.exec(html)) !== null) {
      const card = match[1];
      try {
        const job = this.normalizeFromCard(card);
        if (job && job.title) results.push(job);
      } catch (_) {}
    }

    return results;
  }

  normalizeFromCard(card) {
    const titleMatch = card.match(/<h2[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    if (!titleMatch) return null;

    const link = clean(titleMatch[1]);
    const title = stripHtml(titleMatch[2]);
    const company = extractCompanyFromUrl(link);

    const locMatch = card.match(/ic-16-map-pin[\s\S]*?<span[^>]*>\s*<a>([\s\S]*?)<\/a>/);
    const location = clean(locMatch && locMatch[1]) || 'India';

    const salMatch = card.match(/ic-16-money[\s\S]*?<span class="desktop">\s*([\s\S]*?)\s*<\/span>/);
    const salaryText = clean(salMatch && salMatch[1]);
    const { salaryMin, salaryMax } = parseSalary(salaryText);

    const expMatch = card.match(/ic-16-briefcase[\s\S]*?<span>([\s\S]*?)<\/span>/);
    const experienceText = clean(expMatch && expMatch[1]);

    const skillMatches = card.match(/<span[^>]*class="[^"]*small[^"]*"[^>]*>([\s\S]*?)<\/span>/g) || [];
    const skills = skillMatches
      .map((s) => stripHtml(s.replace(/<[^>]+>/g, '')))
      .filter((s) => s && s.length > 1 && s.length < 50 && !s.includes('+'));

    const dateMatch = card.match(/(\d+\s+(?:hour|day|week|month)s?\s+ago)/);
    const postedText = clean(dateMatch && dateMatch[1]);

    const typeMatch = card.match(/(Fresher|Full\s*Time|Part\s*Time|Internship)/i);
    const isFresher = card.includes('Fresher');

    const descriptionParts = [];
    const descMatch = card.match(/class="about_job"[\s\S]*?<div class="text">\s*([\s\S]*?)<\/div>/);
    if (descMatch) descriptionParts.push(stripHtml(descMatch[1]));
    if (experienceText) descriptionParts.push(`Experience: ${experienceText}`);
    if (salaryText) descriptionParts.push(`Salary: ${salaryText}`);
    const description = descriptionParts.join('\n\n');

    const { category, subCategory } = classifyJob(title, description);
    const extractedSkills = extractSkills(title, description).slice(0, 15);
    const allSkills = [...new Set([...skills, ...extractedSkills])].slice(0, 15);

    const workMode = location.toLowerCase().includes('remote') ? 'remote' : 'onsite';

    const empType = isFresher ? 'full-time'
      : (typeMatch && typeMatch[1].toLowerCase().includes('part')) ? 'part-time'
      : 'full-time';

    const postedDate = this.parseRelativeDate(postedText);

    const logoUrl = company
      ? `https://www.google.com/s2/favicons?domain=internshala.com&sz=128`
      : '';

    return {
      jobId: link.replace(/^\/job\/detail\//, ''),
      title,
      description,
      company: company || 'Internshala',
      logo: logoUrl,
      link: `https://internshala.com${link}`,
      location,
      city: location,
      country: 'India',
      employmentType: empType,
      salaryMin,
      salaryMax,
      salary: salaryMax || salaryMin,
      currency: 'INR',
      postedDate,
      category,
      subCategory,
      requiredSkills: allSkills,
      experienceLevel: mapExperience(experienceText),
      workMode,
      industry: subCategory || '',
    };
  }

  parseRelativeDate(text) {
    const t = clean(text).toLowerCase();
    const now = new Date();
    const m = t.match(/(\d+)\s+(hour|day|week|month)/);
    if (!m) return now;
    const n = parseInt(m[1], 10);
    if (m[2].startsWith('hour')) now.setHours(now.getHours() - n);
    else if (m[2].startsWith('day')) now.setDate(now.getDate() - n);
    else if (m[2].startsWith('week')) now.setDate(now.getDate() - n * 7);
    else if (m[2].startsWith('month')) now.setMonth(now.getMonth() - n);
    return now;
  }
}

module.exports = InternshalaProvider;
