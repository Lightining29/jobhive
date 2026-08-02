/**
 * semanticSearch.service.js
 *
 * Converts a natural language job search query into structured MongoDB filters.
 *
 * Pipeline:
 *  1. Regex/keyword extraction (instant, no API call) — covers 90% of cases
 *  2. LLM extraction via existing llm.service.js — for complex intent
 *  3. Run filters through existing job search pipeline
 *
 * Examples:
 *  "Remote backend jobs using Java and Docker"
 *    → { workMode:'remote', skills:'java,docker', category:'technical' }
 *
 *  "Senior React developer in Bangalore paying 20 LPA"
 *    → { skills:'react', city:'Bangalore', experience:'senior', salaryMin:2000000 }
 *
 *  "Internships for freshers in Delhi not requiring experience"
 *    → { employmentType:'internship', experienceLevel:'fresher', city:'Delhi' }
 */

const intentService = require('./voice/intent.service');
const llmService    = require('./voice/llm.service');
const logger        = require('../config/logger');

// ── LLM extraction prompt ─────────────────────────────────────────────────────

const PARSE_PROMPT = `You are a job search query parser. Extract structured search parameters from the user's natural language query.
Return ONLY valid JSON — no markdown, no explanation.

Return this exact shape (omit fields that are not mentioned):
{
  "skills": "comma-separated lowercase skill names",
  "workMode": "remote|hybrid|onsite",
  "employmentType": "full-time|part-time|contract|internship",
  "experienceLevel": "fresher|junior|mid|senior|lead|internship",
  "city": "city name",
  "country": "country name",
  "salaryMin": number in annual INR (convert LPA: 1 LPA = 100000),
  "sort": "salary|newest|trending",
  "category": "technical|non-technical",
  "search": "job title keywords only (not skills)"
}

Examples:
"Remote backend jobs using Java and Docker" → {"workMode":"remote","skills":"java,docker","category":"technical","search":"backend developer"}
"Senior React developer in Bangalore paying 20 LPA" → {"skills":"react","city":"Bangalore","experienceLevel":"senior","salaryMin":2000000,"search":"react developer"}
"Internships for freshers in Delhi" → {"employmentType":"internship","experienceLevel":"fresher","city":"Delhi"}
"Data science jobs highest salary" → {"skills":"python,machine learning,data science","sort":"salary","category":"technical"}`;

// ── Main export ───────────────────────────────────────────────────────────────

async function parseNaturalQuery(query) {
  if (!query || query.trim().length < 3) return {};

  const text = query.trim().slice(0, 300);

  // Step 1: fast regex extraction (works offline)
  const fast = fastExtract(text);

  // Step 2: if LLM available, enhance with it
  let llmParams = {};
  try {
    const raw = await llmService.generateResponse(
      [{ role: 'user', content: `Parse this job search query: "${text}"` }],
      { systemPrompt: PARSE_PROMPT, maxTokens: 200, temperature: 0.1 }
    );
    const cleaned = raw.replace(/^```(?:json)?/gim, '').replace(/```$/gim, '').trim();
    const start   = cleaned.indexOf('{');
    const end     = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      llmParams = JSON.parse(cleaned.slice(start, end + 1));
    }
  } catch (err) {
    logger.warn('[semanticSearch] LLM parse failed, using regex only', { message: err.message });
  }

  // Merge: LLM wins over regex for overlapping fields
  const merged = { ...fast, ...llmParams };

  return sanitiseParams(merged);
}

// ── Fast regex extractor ──────────────────────────────────────────────────────

function fastExtract(text) {
  const lower = text.toLowerCase();
  const params = {};

  // Work mode
  if (/\bremote\b|work\s+from\s+home|wfh/i.test(text))  params.workMode = 'remote';
  else if (/\bhybrid\b/i.test(text))                       params.workMode = 'hybrid';
  else if (/\bonsite\b|on-site|in.office/i.test(text))     params.workMode = 'onsite';

  // Employment type
  if (/\bintern(ship)?\b/i.test(text))                     params.employmentType = 'internship';
  else if (/\bfull.time\b/i.test(text))                    params.employmentType = 'full-time';
  else if (/\bpart.time\b/i.test(text))                    params.employmentType = 'part-time';
  else if (/\bcontract\b|\bfreelance\b/i.test(text))       params.employmentType = 'contract';

  // Experience level
  if (/\bfresher\b|entry.level|0.year|no\s+experience/i.test(text)) params.experienceLevel = 'fresher';
  else if (/\bjunior\b/i.test(text))                                   params.experienceLevel = 'junior';
  else if (/\bsenior\b|\bsr\.?\b|\blead\b|\bprincipal\b/i.test(text)) params.experienceLevel = 'senior';
  else if (/\bmid.level\b|\bintermediate\b/i.test(text))               params.experienceLevel = 'mid';

  // Sort intent
  if (/highest\s+(pay|salary)|top\s+pay|best.paid|most.paid/i.test(text)) params.sort = 'salary';
  else if (/trending|popular|hot\s+jobs/i.test(text))                       params.sort = 'trending';

  // Category
  if (/\bdata\s+sci|\bml\b|\bai\b|\bmachine\s+learn|\bdevops|\bdeveloper|\bengineer|\bbackend|\bfrontend|\bfullstack|\bfull.stack/i.test(text)) {
    params.category = 'technical';
  }

  // Salary — handle LPA format
  const lpaMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?|lac)/i);
  if (lpaMatch) {
    params.salaryMin = Math.round(parseFloat(lpaMatch[1]) * 100000);
  }
  // Handle "X lakh" range "X-Y LPA"
  const lpaRangeMatch = text.match(/(\d+)\s*[-–to]+\s*(\d+)\s*(?:lpa|lakhs?)/i);
  if (lpaRangeMatch) {
    params.salaryMin = parseInt(lpaRangeMatch[1], 10) * 100000;
  }

  // City — "in [City]" or "at [City]" or "[City] jobs"
  const cityMatch = text.match(/\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/) ||
                    text.match(/\bat\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/) ||
                    text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+jobs\b/);
  if (cityMatch) {
    const excluded = new Set(['Remote','Hybrid','Senior','Junior','Mid','Lead','Full','Part','Best','Top']);
    if (!excluded.has(cityMatch[1])) params.city = cityMatch[1];
  }

  // Skills — match known tech keywords
  const TECH = [
    'javascript','typescript','python','java','kotlin','swift','golang','rust','php','ruby','c++','c#',
    'react','angular','vue','svelte','nextjs','nuxt','gatsby',
    'node','express','django','flask','fastapi','spring','laravel','rails',
    'aws','azure','gcp','docker','kubernetes','terraform','ansible','jenkins','ci/cd',
    'mongodb','postgresql','mysql','redis','elasticsearch','kafka','rabbitmq','graphql',
    'machine learning','deep learning','tensorflow','pytorch','pandas','numpy','scikit',
    'flutter','react native','android','ios',
    'git','linux','bash','microservices','rest api','html','css','tailwind','sass',
    'data science','data engineering','spark','hadoop','airflow',
    'devops','sre','cloud','blockchain','solidity',
  ];
  const foundSkills = TECH.filter(t => lower.includes(t));
  if (foundSkills.length) params.skills = foundSkills.join(',');

  // Search — extract title keywords if no specific skills dominate
  const titlePatterns = [
    /\b(backend|frontend|fullstack|full.stack|data\s+scientist?|data\s+engineer|devops|mobile|ios|android|cloud|security|machine\s+learning|ai|blockchain|embedded)\s+(developer|engineer|architect|lead|manager)?\b/i,
    /\b(software|web|app|application|systems?|platform)\s+(developer|engineer|architect)\b/i,
    /\b(product|project|engineering|technical|it)\s+manager\b/i,
    /\b(ux|ui|product)\s+design\w*\b/i,
    /\bqa\s+engineer|test\s+engineer|sre\b/i,
  ];
  for (const pat of titlePatterns) {
    const m = text.match(pat);
    if (m) { params.search = m[0].trim(); break; }
  }

  return params;
}

// ── Sanitise final params ─────────────────────────────────────────────────────

function sanitiseParams(raw) {
  const out = {};

  if (typeof raw.skills === 'string' && raw.skills.trim())
    out.skills = raw.skills.toLowerCase().slice(0, 200);

  if (['remote','hybrid','onsite'].includes(raw.workMode))
    out.workMode = raw.workMode;

  if (['full-time','part-time','contract','internship'].includes(raw.employmentType))
    out.employmentType = raw.employmentType;

  if (['fresher','junior','mid','senior','lead','internship'].includes(raw.experienceLevel))
    out.experience = raw.experienceLevel;

  if (typeof raw.city === 'string' && raw.city.trim())
    out.city = raw.city.trim().slice(0, 80);

  if (typeof raw.country === 'string' && raw.country.trim())
    out.country = raw.country.trim().slice(0, 80);

  if (typeof raw.salaryMin === 'number' && raw.salaryMin > 0)
    out.salaryMin = raw.salaryMin;

  if (['salary','newest','trending','oldest'].includes(raw.sort))
    out.sort = raw.sort;

  if (['technical','non-technical'].includes(raw.category))
    out.category = raw.category;

  if (typeof raw.search === 'string' && raw.search.trim())
    out.search = raw.search.trim().slice(0, 100);

  return out;
}

module.exports = { parseNaturalQuery };
