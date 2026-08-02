/**
 * profileExtractor.service.js
 *
 * Uses the LLM to extract structured profile data from a natural language
 * description.  Returns JSON that matches the User model fields exactly so
 * the frontend can populate the profile form directly.
 *
 * Always falls back to a safe empty structure — never throws to the caller.
 */

const llmService = require('./llm.service');
const logger = require('../../config/logger');

const EXTRACT_SYSTEM_PROMPT = `You are a profile data extractor for a job portal.
The user will describe themselves in natural language.
Extract structured profile information and return ONLY valid JSON — no markdown, no explanation, no code fences.

Return this exact JSON shape (omit fields you cannot confidently extract, use null for missing fields):
{
  "name": "string or null",
  "headline": "string or null — short professional title e.g. 'Full Stack Developer at TCS'",
  "phone": "string or null",
  "bio": "string or null — 2-3 sentence professional summary",
  "skills": ["array", "of", "lowercase", "skill", "strings"],
  "experience": [
    {
      "role": "string",
      "company": "string",
      "startDate": "YYYY-MM-DD or null",
      "endDate": "YYYY-MM-DD or null",
      "current": true or false,
      "description": "string or null"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "fieldOfStudy": "string or null",
      "startYear": number or null,
      "endYear": number or null
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string or null",
      "year": number or null
    }
  ],
  "socialLinks": {
    "linkedin": "url or null",
    "github": "url or null",
    "portfolio": "url or null"
  },
  "preferences": {
    "preferredJobTitle": "string or null",
    "preferredLocations": ["array of location strings"],
    "preferredWorkMode": "remote or hybrid or onsite or null",
    "preferredEmploymentType": "full-time or part-time or contract or internship or null",
    "preferredSalary": number or null,
    "preferredSalaryCurrency": "USD or INR or EUR or GBP or null"
  }
}

Rules:
- Return ONLY the JSON object, nothing else
- Skills must be lowercase strings
- Dates must be ISO format YYYY-MM-DD or null
- Years must be numbers, not strings
- If the user mentions "currently working" set current:true and endDate:null
- Infer reasonable values from context (e.g. "software engineer" → skills include common SE skills)
- Never hallucinate — only extract what is mentioned or strongly implied`;

/**
 * Extract structured profile fields from a natural language description.
 * @param {string} userText  — what the user typed/spoke about themselves
 * @param {object} existingProfile — current profile to merge context
 * @returns {Promise<object>}  — partial profile fields safe to merge into the form
 */
async function extractProfileFromText(userText, existingProfile = {}) {
  const contextParts = [];

  if (existingProfile.name)     contextParts.push(`Current name: ${existingProfile.name}`);
  if (existingProfile.headline) contextParts.push(`Current headline: ${existingProfile.headline}`);
  if (existingProfile.skills?.length)
    contextParts.push(`Current skills: ${existingProfile.skills.join(', ')}`);

  const contextBlock = contextParts.length
    ? `\nExisting profile context:\n${contextParts.join('\n')}\n`
    : '';

  const messages = [
    {
      role: 'user',
      content: `${contextBlock}\nUser description:\n${userText}\n\nExtract and return JSON only.`,
    },
  ];

  let rawText = '';
  try {
    rawText = await llmService.generateResponse(messages, {
      systemPrompt: EXTRACT_SYSTEM_PROMPT,
      maxTokens: 1200,
      temperature: 0.1,  // low temperature for deterministic extraction
    });
  } catch (err) {
    logger.warn('[profileExtractor] LLM call failed', { message: err.message });
    return buildFallbackExtraction(userText);
  }

  // Strip any markdown fences the model may have added despite instructions
  const cleaned = rawText
    .replace(/^```(?:json)?/gim, '')
    .replace(/```$/gim, '')
    .trim();

  // Find the first { ... } block
  const start = cleaned.indexOf('{');
  const end   = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) {
    logger.warn('[profileExtractor] LLM did not return JSON', { rawText: rawText.slice(0, 200) });
    return buildFallbackExtraction(userText);
  }

  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    return sanitiseExtraction(parsed);
  } catch (err) {
    logger.warn('[profileExtractor] JSON parse failed', { err: err.message, raw: cleaned.slice(0, 200) });
    return buildFallbackExtraction(userText);
  }
}

// ── Sanitise / coerce types so nothing bad reaches the DB ────────────────────

function sanitiseExtraction(raw) {
  const out = {};

  if (typeof raw.name === 'string' && raw.name.trim())
    out.name = raw.name.trim().slice(0, 80);

  if (typeof raw.headline === 'string' && raw.headline.trim())
    out.headline = raw.headline.trim().slice(0, 160);

  if (typeof raw.phone === 'string' && raw.phone.trim())
    out.phone = raw.phone.trim().slice(0, 20);

  if (typeof raw.bio === 'string' && raw.bio.trim())
    out.bio = raw.bio.trim().slice(0, 1000);

  if (Array.isArray(raw.skills))
    out.skills = raw.skills
      .filter((s) => typeof s === 'string' && s.trim())
      .map((s) => s.trim().toLowerCase())
      .slice(0, 30);

  if (Array.isArray(raw.experience))
    out.experience = raw.experience
      .filter((e) => e && (e.role || e.company))
      .map((e) => ({
        role:        safeStr(e.role),
        company:     safeStr(e.company),
        startDate:   safeDate(e.startDate),
        endDate:     e.current ? null : safeDate(e.endDate),
        current:     Boolean(e.current),
        description: safeStr(e.description, 500),
      }))
      .slice(0, 10);

  if (Array.isArray(raw.education))
    out.education = raw.education
      .filter((e) => e && (e.institution || e.degree))
      .map((e) => ({
        institution:  safeStr(e.institution),
        degree:       safeStr(e.degree),
        fieldOfStudy: safeStr(e.fieldOfStudy),
        startYear:    safeYear(e.startYear),
        endYear:      safeYear(e.endYear),
      }))
      .slice(0, 5);

  if (Array.isArray(raw.certifications))
    out.certifications = raw.certifications
      .filter((c) => c && c.name)
      .map((c) => ({
        name:   safeStr(c.name),
        issuer: safeStr(c.issuer),
        year:   safeYear(c.year),
      }))
      .slice(0, 10);

  if (raw.socialLinks && typeof raw.socialLinks === 'object') {
    out.socialLinks = {
      linkedin:  safeUrl(raw.socialLinks.linkedin),
      github:    safeUrl(raw.socialLinks.github),
      portfolio: safeUrl(raw.socialLinks.portfolio),
    };
  }

  if (raw.preferences && typeof raw.preferences === 'object') {
    const p = raw.preferences;
    out.preferences = {};
    if (typeof p.preferredJobTitle === 'string' && p.preferredJobTitle.trim())
      out.preferences.preferredJobTitle = p.preferredJobTitle.trim().slice(0, 100);
    if (Array.isArray(p.preferredLocations))
      out.preferences.preferredLocations = p.preferredLocations
        .filter((l) => typeof l === 'string' && l.trim())
        .map((l) => l.trim())
        .slice(0, 5);
    const validModes = ['remote', 'hybrid', 'onsite'];
    if (validModes.includes(p.preferredWorkMode))
      out.preferences.preferredWorkMode = p.preferredWorkMode;
    const validTypes = ['full-time', 'part-time', 'contract', 'internship'];
    if (validTypes.includes(p.preferredEmploymentType))
      out.preferences.preferredEmploymentType = p.preferredEmploymentType;
    if (typeof p.preferredSalary === 'number' && p.preferredSalary > 0)
      out.preferences.preferredSalary = p.preferredSalary;
    const validCurrencies = ['USD', 'INR', 'EUR', 'GBP'];
    if (validCurrencies.includes(p.preferredSalaryCurrency))
      out.preferences.preferredSalaryCurrency = p.preferredSalaryCurrency;
  }

  return out;
}

// ── Regex-based fallback when LLM is offline ─────────────────────────────────

function buildFallbackExtraction(text) {
  const out = {};
  const lower = text.toLowerCase();

  // Skills — match known tech keywords
  const TECH = ['javascript','typescript','python','java','react','angular','vue','node','express',
    'django','flask','spring','aws','azure','docker','kubernetes','mongodb','postgresql','mysql',
    'redis','graphql','rest','html','css','tailwind','nextjs','flutter','kotlin','swift','golang',
    'git','ci/cd','figma','sql','pandas','numpy','tensorflow','pytorch','scikit','machine learning'];
  const foundSkills = TECH.filter((t) => lower.includes(t));
  if (foundSkills.length) out.skills = foundSkills;

  // Headline — first sentence if short enough
  const firstSentence = text.split(/[.!?]/)[0].trim();
  if (firstSentence.length > 10 && firstSentence.length < 160)
    out.headline = firstSentence;

  // Work mode preference
  if (lower.includes('remote'))   out.preferences = { ...(out.preferences || {}), preferredWorkMode: 'remote' };
  if (lower.includes('hybrid'))   out.preferences = { ...(out.preferences || {}), preferredWorkMode: 'hybrid' };

  return out;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function safeStr(val, maxLen = 200) {
  if (val === null || val === undefined) return '';
  return String(val).trim().slice(0, maxLen) || '';
}

function safeDate(val) {
  if (!val) return '';
  const d = new Date(val);
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

function safeYear(val) {
  const n = parseInt(val, 10);
  return (Number.isFinite(n) && n > 1950 && n < 2100) ? n : null;
}

function safeUrl(val) {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (!trimmed) return '';
  try {
    new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    return trimmed;
  } catch {
    return '';
  }
}

module.exports = { extractProfileFromText };
