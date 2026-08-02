/**
 * resumeAnalyzer.service.js
 *
 * Full AI-powered resume analysis pipeline:
 *
 *  1. Extract text from PDF / DOCX
 *  2. Grammar check via HuggingFace Inference API
 *  3. Deep analysis (ATS, skills, bullets, keywords) via OpenRouter
 *  4. Algorithmic fallback when both APIs are offline
 *
 * ENV vars:
 *   HUGGINGFACE_API_KEY   — HuggingFace token (hf_...)
 *   OPENROUTER_API_KEY    — OpenRouter key (sk-or-...)
 *   OPENROUTER_MODEL      — defaults to meta-llama/llama-3.1-8b-instruct:free
 */

const fs   = require('fs');
const path = require('path');
const logger = require('../config/logger');
const { generateJSON, grammarCorrect } = require('./aiProviders.service');

// ── Config ────────────────────────────────────────────────────────────────────
// Keys are read inside aiProviders.service.js — no duplication needed here.

// ── Text extraction ───────────────────────────────────────────────────────────

async function extractText(filePath, mimeType) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf' || mimeType === 'application/pdf') {
    const pdfParse = require('pdf-parse');
    const buffer   = fs.readFileSync(filePath);
    const data     = await pdfParse(buffer);
    return data.text || '';
  }

  if (ext === '.docx' || mimeType?.includes('wordprocessingml')) {
    const mammoth = require('mammoth');
    const result  = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  }

  if (ext === '.doc' || mimeType === 'application/msword') {
    // .doc: read as buffer and extract readable ASCII text
    const buffer = fs.readFileSync(filePath);
    return buffer.toString('utf8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

// ── HuggingFace grammar check ─────────────────────────────────────────────────

async function hfGrammarCheck(sentences) {
  const sample = sentences.slice(0, 5).join(' ');
  const corrected = await grammarCorrect(sample);
  return corrected;
}

// ── Deep analysis via best available provider ─────────────────────────────────

const ANALYSIS_PROMPT = `You are an expert ATS resume analyst and career coach.
Analyse the resume text and return ONLY valid JSON — no markdown, no code fences.

Return exactly this shape:
{
  "atsScore": 0-100,
  "atsGrade": "A/B/C/D/F",
  "sections": {
    "formatting":  { "score": 0-100, "feedback": "one sentence" },
    "keywords":    { "score": 0-100, "feedback": "one sentence" },
    "experience":  { "score": 0-100, "feedback": "one sentence" },
    "skills":      { "score": 0-100, "feedback": "one sentence" },
    "education":   { "score": 0-100, "feedback": "one sentence" }
  },
  "grammarIssues": [
    { "original": "sentence with error", "fixed": "corrected sentence", "issue": "description" }
  ],
  "missingSkills": ["skill1", "skill2"],
  "weakBullets": [
    { "original": "weak bullet point", "improved": "stronger version with action verb and metric" }
  ],
  "keywordSuggestions": ["keyword1", "keyword2"],
  "industryImprovements": [
    { "priority": "high|medium|low", "title": "improvement title", "detail": "specific advice" }
  ],
  "detectedRole": "inferred job target e.g. Software Engineer",
  "detectedIndustry": "e.g. Technology",
  "overallSummary": "2-3 sentence honest assessment"
}

Rules:
- grammarIssues: max 5
- weakBullets: max 4, only if actually weak (no action verb or metric)
- missingSkills: based on detected role, max 8
- keywordSuggestions: ATS keywords missing from resume, max 10
- industryImprovements: max 5, prioritised`;

async function openRouterAnalysis(resumeText) {
  const truncated = resumeText.slice(0, 4000);
  return generateJSON(ANALYSIS_PROMPT, `RESUME TEXT:\n${truncated}`, 2000);
}

// ── Algorithmic fallback ──────────────────────────────────────────────────────

function algorithmicAnalysis(text, profile = {}) {
  const lower = text.toLowerCase();
  const lines  = text.split('\n').map(s => s.trim()).filter(Boolean);
  const words  = lower.split(/\s+/);

  // Detect action verbs
  const ACTION_VERBS = ['developed','built','designed','led','managed','created','implemented',
    'improved','increased','reduced','launched','delivered','achieved','automated','optimized',
    'architected','engineered','deployed','mentored','collaborated','analysed','resolved'];
  const METRICS_RE = /\d+\s*(%|x|times|users|clients|projects|million|k\b|lpa|days|hours)/i;

  // Bullet analysis
  const bulletLines = lines.filter(l => /^[-•*▸>]/.test(l) || /^\d+\./.test(l));
  const weakBullets = bulletLines
    .filter(b => {
      const bl = b.toLowerCase().replace(/^[-•*▸>\d.]+\s*/, '');
      const hasVerb = ACTION_VERBS.some(v => bl.startsWith(v));
      const hasMetric = METRICS_RE.test(b);
      return !hasVerb || !hasMetric;
    })
    .slice(0, 4)
    .map(b => ({
      original: b,
      improved: `${b} — add a quantified metric (e.g. "by 30%") and start with an action verb`,
    }));

  // Tech keywords present
  const TECH_KEYWORDS = ['javascript','typescript','python','java','react','angular','vue','node',
    'express','aws','azure','gcp','docker','kubernetes','sql','mongodb','postgresql','redis',
    'graphql','rest','api','git','ci/cd','agile','scrum','microservices','html','css','linux',
    'tensorflow','pytorch','machine learning','data science','flutter','swift','kotlin'];
  const foundKeywords = TECH_KEYWORDS.filter(k => lower.includes(k));

  // Scoring
  const hasEmail    = /@/.test(text);
  const hasPhone    = /\+?\d[\d\s\-().]{8,}\d/.test(text);
  const hasLinkedin = /linkedin/.test(lower);
  const hasGithub   = /github/.test(lower);
  const hasSummary  = /(summary|objective|profile|about)/i.test(text);
  const hasExp      = /(experience|employment|work history)/i.test(text);
  const hasEdu      = /(education|university|college|degree|bachelor|master)/i.test(text);
  const hasSkills   = /(skills|technologies|competencies)/i.test(text);
  const wordCount   = words.length;

  let format = 0;
  if (hasEmail)    format += 15;
  if (hasPhone)    format += 10;
  if (hasLinkedin) format += 10;
  if (hasGithub)   format += 10;
  if (hasSummary)  format += 15;
  if (wordCount > 200 && wordCount < 1200) format += 20;
  else if (wordCount >= 100) format += 10;
  if (lines.length > 10) format += 20;

  const keywordsScore = Math.min(100, foundKeywords.length * 8);
  const expScore  = hasExp  ? Math.min(100, bulletLines.length * 12) : 20;
  const eduScore  = hasEdu  ? 80 : 30;
  const skillsScore = hasSkills ? Math.min(100, foundKeywords.length * 10) : 20;

  const atsScore = Math.round(format * 0.2 + keywordsScore * 0.3 + expScore * 0.25 + eduScore * 0.1 + skillsScore * 0.15);
  const atsGrade = atsScore >= 85 ? 'A' : atsScore >= 70 ? 'B' : atsScore >= 55 ? 'C' : atsScore >= 40 ? 'D' : 'F';

  // Infer role from profile or text
  const detectedRole = profile.headline || (lower.includes('data') ? 'Data Professional' : lower.includes('front') ? 'Frontend Developer' : lower.includes('back') ? 'Backend Developer' : 'Software Engineer');

  // Missing skills based on detected keywords
  const COMMON_SKILLS = ['git','docker','aws','sql','rest api','agile','typescript','testing','linux'];
  const missingSkills = COMMON_SKILLS.filter(s => !lower.includes(s)).slice(0, 6);

  // Keyword suggestions
  const keywordSuggestions = ['quantified achievements','action verbs','industry keywords',
    'role-specific technologies','soft skills','certifications'].filter(k => !lower.includes(k.split(' ')[0])).slice(0, 6);

  const improvements = [];
  if (!hasSummary)    improvements.push({ priority: 'high',   title: 'Add professional summary', detail: 'A 3-4 sentence summary at the top increases ATS parsing accuracy.' });
  if (weakBullets.length > 2) improvements.push({ priority: 'high', title: 'Strengthen bullet points', detail: 'Start each bullet with an action verb and add measurable outcomes.' });
  if (!hasLinkedin)   improvements.push({ priority: 'medium', title: 'Add LinkedIn URL', detail: 'Recruiters expect a LinkedIn link in modern resumes.' });
  if (foundKeywords.length < 5) improvements.push({ priority: 'high', title: 'Add technical keywords', detail: 'Include more role-specific keywords to pass ATS filters.' });
  if (wordCount > 1200) improvements.push({ priority: 'medium', title: 'Shorten resume', detail: 'Keep to 1 page for under 5 years experience, 2 pages maximum.' });
  if (!hasGithub)     improvements.push({ priority: 'low',    title: 'Add GitHub profile', detail: 'A GitHub link demonstrates real work to technical recruiters.' });

  return {
    atsScore,
    atsGrade,
    sections: {
      formatting:  { score: format,       feedback: `${hasEmail ? 'Contact info present' : 'Add email/phone'}${hasSummary ? ', summary found' : ', add summary'}` },
      keywords:    { score: keywordsScore, feedback: `${foundKeywords.length} technical keywords detected` },
      experience:  { score: expScore,      feedback: hasExp ? `${bulletLines.length} bullet points found` : 'Work experience section missing' },
      skills:      { score: skillsScore,   feedback: hasSkills ? `Skills section present with ${foundKeywords.length} keywords` : 'Add a dedicated skills section' },
      education:   { score: eduScore,      feedback: hasEdu ? 'Education section present' : 'Education section not detected' },
    },
    grammarIssues:         [],
    missingSkills,
    weakBullets,
    keywordSuggestions,
    industryImprovements:  improvements,
    detectedRole,
    detectedIndustry:      lower.includes('finance') ? 'Finance' : lower.includes('health') ? 'Healthcare' : 'Technology',
    overallSummary:        `Your resume scores ${atsScore}/100 on ATS compatibility. ${atsScore < 60 ? 'Focus on adding quantified achievements and more technical keywords.' : 'Good foundation — strengthen bullet points and add missing keywords for better results.'}`,
    _fallback: true,
  };
}

// ── Main export ───────────────────────────────────────────────────────────────

async function analyzeResume(filePath, mimeType, profile = {}) {
  // 1. Extract text
  let resumeText = '';
  try {
    resumeText = await extractText(filePath, mimeType);
  } catch (err) {
    logger.error('[resumeAnalyzer] text extraction failed', { message: err.message });
    throw new Error(`Could not read resume file: ${err.message}`);
  }

  if (!resumeText || resumeText.trim().length < 50) {
    throw new Error('Resume appears to be empty or unreadable. Please upload a text-based PDF or DOCX.');
  }

  const cleanText = resumeText.replace(/\s+/g, ' ').trim().slice(0, 6000);

  // 2. Grammar check (HuggingFace) — run in parallel with deep analysis
  const sentences = cleanText
    .split(/[.!?]\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 200)
    .slice(0, 10);

  const [grammarCorrected, deepAnalysis] = await Promise.allSettled([
    hfGrammarCheck(sentences),
    openRouterAnalysis(cleanText),
  ]);

  // 3. Use OpenRouter analysis if available, else algorithmic
  let result;
  if (deepAnalysis.status === 'fulfilled' && deepAnalysis.value) {
    result = sanitiseAnalysis(deepAnalysis.value);
  } else {
    result = algorithmicAnalysis(cleanText, profile);
  }

  // 4. Merge grammar corrections from HuggingFace if available
  if (grammarCorrected.status === 'fulfilled' && grammarCorrected.value && !result.grammarIssues?.length) {
    const corrected = grammarCorrected.value;
    if (corrected !== cleanText.slice(0, corrected.length)) {
      result.grammarIssues = [{
        original: sentences[0] || '',
        fixed: corrected,
        issue: 'Grammar correction suggested by AI',
      }];
    }
  }

  result.resumeText  = cleanText.slice(0, 500) + (cleanText.length > 500 ? '…' : '');
  result.wordCount   = cleanText.split(/\s+/).length;
  result.analyzedAt  = new Date().toISOString();

  return result;
}

// ── Sanitise OpenRouter output ────────────────────────────────────────────────

function sanitiseAnalysis(raw) {
  return {
    atsScore:             Math.min(100, Math.max(0, parseInt(raw.atsScore, 10) || 0)),
    atsGrade:             ['A','B','C','D','F'].includes(raw.atsGrade) ? raw.atsGrade : 'C',
    sections:             raw.sections || {},
    grammarIssues:        Array.isArray(raw.grammarIssues)        ? raw.grammarIssues.slice(0, 5)        : [],
    missingSkills:        Array.isArray(raw.missingSkills)        ? raw.missingSkills.slice(0, 8)        : [],
    weakBullets:          Array.isArray(raw.weakBullets)          ? raw.weakBullets.slice(0, 4)          : [],
    keywordSuggestions:   Array.isArray(raw.keywordSuggestions)   ? raw.keywordSuggestions.slice(0, 10)  : [],
    industryImprovements: Array.isArray(raw.industryImprovements) ? raw.industryImprovements.slice(0, 5) : [],
    detectedRole:         String(raw.detectedRole  || 'Software Professional').slice(0, 80),
    detectedIndustry:     String(raw.detectedIndustry || 'Technology').slice(0, 80),
    overallSummary:       String(raw.overallSummary || '').slice(0, 400),
  };
}

module.exports = { analyzeResume };
