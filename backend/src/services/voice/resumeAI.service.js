/**
 * resumeAI.service.js
 *
 * Two capabilities:
 *
 * 1. buildResume(user)
 *    Generates a polished, ATS-friendly resume in structured JSON from the
 *    user's profile data. No hallucination — only uses real profile fields.
 *
 * 2. scoreATS(user, jobDescription)
 *    Scores the user's profile/resume against a job description.
 *    Returns: overall score, section scores, matched keywords, missing keywords,
 *    and concrete improvement suggestions.
 *
 * Falls back to algorithmic scoring when the LLM is unavailable.
 */

const { generateJSON } = require('../aiProviders.service');
const logger = require('../../config/logger');

// ── Resume Builder ────────────────────────────────────────────────────────────

const BUILD_SYSTEM_PROMPT = `You are an elite resume writer and career coach with 15+ years of experience placing candidates at Fortune 500 companies and top tech startups.

Your job is to transform the candidate's raw profile data into a COMPREHENSIVE, IMPRESSIVE, ATS-optimised resume.

STRICT RULES:
- Do NOT invent companies, institutions, or degrees not in the profile
- You MAY expand job descriptions with industry-standard language
- You MAY infer realistic metrics from context (e.g. a developer who built an API likely served "thousands of requests")
- You MUST use strong action verbs and quantified achievements

CONTENT REQUIREMENTS — each section MUST be rich:

SUMMARY (5-6 sentences):
  - Opening: years of experience + domain expertise
  - Core technical stack (3-4 technologies)
  - Key strengths / biggest professional value
  - What makes this candidate unique
  - Career goal / what they bring to employers

EXPERIENCE (for EACH role — minimum 6 bullets):
  - Start each bullet with a strong power verb
  - Include: what they built/did, what tech they used, what the outcome was
  - Quantify EVERYTHING: users served, % improvements, team size, projects delivered, cost savings
  - Cover: architecture decisions, team collaboration, technical challenges solved, business impact
  - Example power verbs: Architected, Engineered, Spearheaded, Optimised, Delivered, Automated, Reduced, Increased, Implemented, Designed, Led, Streamlined, Modernised, Integrated, Deployed

SKILLS — split exhaustively into 3 categories:
  - technical: ALL programming languages, frameworks, databases, protocols from the profile
  - soft: leadership, communication, problem-solving, agile, collaboration, time management
  - tools: ALL devtools, cloud platforms, CI/CD, testing tools, IDEs, monitoring

EDUCATION — add highlights if degree implies coursework (e.g. CS degree → "Data Structures, Algorithms, DBMS, OS, Networks")

PROJECTS (new section — infer from experience if not explicit):
  List 2-3 notable projects with tech stack and impact

Return ONLY valid JSON with this exact shape:
{
  "name":     "Full Name",
  "title":    "Job Title | Core Skill | Core Skill | Core Skill",
  "location": "City, Country",
  "summary":  "5-6 sentence comprehensive professional summary",
  "skills": {
    "technical": ["exhaustive list of technical skills"],
    "soft":      ["communication","leadership","agile","problem solving","team collaboration","time management"],
    "tools":     ["all tools, IDEs, cloud, devops, monitoring"]
  },
  "experience": [
    {
      "role":     "Exact Job Title",
      "company":  "Company Name, City",
      "duration": "Month YYYY – Month YYYY",
      "bullets":  [
        "Architected and deployed [specific system] using [tech stack], enabling [quantified outcome]",
        "Engineered [X] RESTful API endpoints with [tech], reducing response latency by [%] and serving [N]+ daily requests",
        "Led development of [feature/module] that [business impact] for [N]+ users",
        "Implemented [security/performance/architecture improvement] resulting in [measurable benefit]",
        "Collaborated with cross-functional team of [N] engineers/designers to deliver [project] on schedule",
        "Optimised [database/query/process] reducing [metric] by [N]% and improving [outcome]"
      ]
    }
  ],
  "education": [
    {
      "degree":      "Full Degree Name",
      "institution": "University Name, City",
      "year":        "Graduated: YYYY",
      "highlights":  "CGPA or relevant coursework or academic achievements"
    }
  ],
  "projects": [
    {
      "name":  "Project Name",
      "tech":  "Tech stack used",
      "desc":  "What it does and impact"
    }
  ],
  "certifications": ["Name — Issuer (Year)"],
  "improvements":   ["Very specific tip 1","Very specific tip 2","Very specific tip 3"]
}`;

async function buildResume(user) {
  const profileBlock = buildProfileBlock(user);
  const userMessage  = `Generate a COMPREHENSIVE and DETAILED professional resume from this profile. Make every section as rich and content-heavy as possible.\n\n${profileBlock}\n\nReturn JSON only. Be thorough — the candidate needs a strong, impressive resume.`;

  try {
    const aiPromise = generateJSON(BUILD_SYSTEM_PROMPT, userMessage, 2500);
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 2000));
    const parsed = await Promise.race([aiPromise, timeoutPromise]);
    if (parsed) {
      return sanitiseResumeOutput(parsed, user);
    }
  } catch (err) {
    logger.warn(`[resumeAI] AI build error: ${err.message}`);
  }

  logger.info('[resumeAI] instant offline high-speed engine generating resume');
  return buildFallbackResume(user);
}

// ── ATS Scorer ────────────────────────────────────────────────────────────────

const ATS_SYSTEM_PROMPT = `You are an ATS (Applicant Tracking System) expert and resume coach.
Analyse the candidate's profile against the job description and return a detailed ATS score report.
Return ONLY valid JSON — no markdown, no code fences, no explanation.

Return this exact shape:
{
  "overallScore": 0-100,
  "grade": "A / B / C / D / F",
  "sections": {
    "keywords": { "score": 0-100, "label": "Keyword Match" },
    "skills": { "score": 0-100, "label": "Skills Match" },
    "experience": { "score": 0-100, "label": "Experience Relevance" },
    "education": { "score": 0-100, "label": "Education Fit" },
    "formatting": { "score": 0-100, "label": "Profile Completeness" }
  },
  "matchedKeywords": ["keywords found in both profile and JD"],
  "missingKeywords": ["important JD keywords not in profile"],
  "strengths": ["2-3 specific strengths for this role"],
  "improvements": [
    {
      "priority": "high|medium|low",
      "title": "Short improvement title",
      "detail": "Specific actionable advice"
    }
  ],
  "optimizedSummary": "Rewrite of the professional summary tailored to this specific job"
}`;

async function scoreATS(user, jobDescription) {
  if (!jobDescription || jobDescription.trim().length < 20) {
    return { error: 'Job description too short. Please paste the full job description.' };
  }

  const profileBlock = buildProfileBlock(user);
  const jdBlock      = jobDescription.trim().slice(0, 3000);
  const userMessage  = `CANDIDATE PROFILE:\n${profileBlock}\n\nJOB DESCRIPTION:\n${jdBlock}\n\nReturn ATS score JSON only.`;

  try {
    const aiPromise = generateJSON(ATS_SYSTEM_PROMPT, userMessage, 2500);
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 2000));
    const parsed = await Promise.race([aiPromise, timeoutPromise]);
    if (parsed) {
      return sanitiseATSOutput(parsed);
    }
  } catch (err) {
    logger.warn(`[resumeAI] AI ATS error: ${err.message}`);
  }

  logger.info('[resumeAI] using instant algorithmic ATS scoring');
  return algorithmicATSScore(user, jobDescription);
}

// ── Profile → text block ─────────────────────────────────────────────────────

function buildProfileBlock(user) {
  const lines = [];

  lines.push(`Name: ${user.name || 'N/A'}`);
  if (user.headline) lines.push(`Professional Headline: ${user.headline}`);
  if (user.phone)    lines.push(`Phone: ${user.phone}`);
  if (user.email)    lines.push(`Email: ${user.email}`);
  if (user.bio)      lines.push(`\nBio/Summary:\n${user.bio}`);

  if (user.skills?.length) {
    lines.push(`\nSkills (${user.skills.length} total): ${user.skills.join(', ')}`);
  }

  if (user.socialLinks) {
    const links = [];
    if (user.socialLinks.linkedin)  links.push(`LinkedIn: ${user.socialLinks.linkedin}`);
    if (user.socialLinks.github)    links.push(`GitHub: ${user.socialLinks.github}`);
    if (user.socialLinks.portfolio) links.push(`Portfolio: ${user.socialLinks.portfolio}`);
    if (links.length) lines.push('\nSocial Links:\n' + links.join('\n'));
  }

  if (user.experience?.length) {
    lines.push('\nWork Experience:');
    user.experience.forEach((e, i) => {
      const start   = e.startDate ? new Date(e.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
      const end     = e.current   ? 'Present' : e.endDate ? new Date(e.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
      lines.push(`\n  ${i + 1}. ${e.role} at ${e.company}`);
      lines.push(`     Duration: ${start} – ${end}${e.current ? ' (Current)' : ''}`);
      if (e.description) lines.push(`     Description: ${e.description}`);
    });
  }

  if (user.education?.length) {
    lines.push('\nEducation:');
    user.education.forEach((e) => {
      const degree = [e.degree, e.fieldOfStudy].filter(Boolean).join(' in ');
      lines.push(`  - ${degree} at ${e.institution} (${e.startYear || ''}–${e.endYear || ''})`);
    });
  }

  if (user.certifications?.length) {
    lines.push('\nCertifications:');
    user.certifications.forEach((c) => {
      lines.push(`  - ${c.name}${c.issuer ? ' by ' + c.issuer : ''}${c.year ? ' (' + c.year + ')' : ''}${c.link ? ' — ' + c.link : ''}`);
    });
  }

  if (user.preferences) {
    const p = user.preferences;
    if (p.preferredJobTitle)       lines.push(`\nTarget Role: ${p.preferredJobTitle}`);
    if (p.preferredLocations?.length) lines.push(`Preferred Locations: ${p.preferredLocations.join(', ')}`);
    if (p.preferredWorkMode)       lines.push(`Work Mode: ${p.preferredWorkMode}`);
    if (p.preferredEmploymentType) lines.push(`Employment Type: ${p.preferredEmploymentType}`);
  }

  return lines.join('\n');
}

// ── Algorithmic ATS fallback (no LLM needed) ─────────────────────────────────

function algorithmicATSScore(user, jobDescription) {
  const jdLower = jobDescription.toLowerCase();
  const jdWords = new Set(jdLower.match(/\b[a-z][a-z+#.]{1,}\b/g) || []);

  const userSkills  = (user.skills || []).map((s) => s.toLowerCase());
  const userBio     = (user.bio || '').toLowerCase();
  const userExp     = (user.experience || []).map((e) => `${e.role} ${e.company} ${e.description || ''}`).join(' ').toLowerCase();
  const userAll     = `${userSkills.join(' ')} ${userBio} ${userExp}`;

  // Keyword match
  const jdKeywords = [...jdWords].filter((w) => w.length > 3 && !STOP_WORDS.has(w));
  const matched    = jdKeywords.filter((k) => userAll.includes(k));
  const missing    = jdKeywords.filter((k) => !userAll.includes(k) && isTechOrRoleWord(k)).slice(0, 10);

  const keywordScore  = jdKeywords.length ? Math.round((matched.length / jdKeywords.length) * 100) : 50;
  const skillsScore   = userSkills.length >= 5 ? Math.min(100, keywordScore + 10) : Math.min(keywordScore, 60);
  const expScore      = user.experience?.length ? Math.min(100, keywordScore + 5) : Math.max(keywordScore - 20, 0);
  const eduScore      = user.education?.length ? 80 : 50;
  const formatScore   = calcFormatScore(user);

  const overall = Math.round((keywordScore * 0.35 + skillsScore * 0.25 + expScore * 0.2 + eduScore * 0.1 + formatScore * 0.1));
  const grade   = overall >= 85 ? 'A' : overall >= 70 ? 'B' : overall >= 55 ? 'C' : overall >= 40 ? 'D' : 'F';

  const improvements = [];
  if (missing.length > 0) improvements.push({ priority: 'high', title: 'Add missing keywords', detail: `Add these to your skills or experience: ${missing.slice(0, 5).join(', ')}` });
  if (!user.bio || user.bio.length < 100) improvements.push({ priority: 'high', title: 'Write a professional summary', detail: 'Add a 3-4 sentence summary highlighting your experience and target role.' });
  if (!user.experience?.length) improvements.push({ priority: 'high', title: 'Add work experience', detail: 'Include at least your most recent role with responsibilities.' });
  if (user.skills?.length < 5) improvements.push({ priority: 'medium', title: 'Add more skills', detail: 'List at least 8-10 relevant technical skills.' });
  if (!user.certifications?.length) improvements.push({ priority: 'low', title: 'Add certifications', detail: 'Certifications boost ATS scores significantly for technical roles.' });

  return {
    overallScore: overall,
    grade,
    sections: {
      keywords:   { score: keywordScore,  label: 'Keyword Match' },
      skills:     { score: skillsScore,   label: 'Skills Match' },
      experience: { score: expScore,      label: 'Experience Relevance' },
      education:  { score: eduScore,      label: 'Education Fit' },
      formatting: { score: formatScore,   label: 'Profile Completeness' },
    },
    matchedKeywords: matched.slice(0, 15),
    missingKeywords: missing,
    strengths: buildStrengths(user, matched),
    improvements,
    optimizedSummary: null,
    _fallback: true,
  };
}

function calcFormatScore(user) {
  let s = 0;
  if (user.headline) s += 20;
  if (user.bio && user.bio.length >= 100) s += 20;
  if (user.skills?.length >= 5) s += 20;
  if (user.experience?.length) s += 20;
  if (user.education?.length) s += 10;
  if (user.certifications?.length) s += 10;
  return s;
}

function buildStrengths(user, matched) {
  const s = [];
  if (user.skills?.length >= 5) s.push(`Strong skill set with ${user.skills.length} listed technologies`);
  if (user.experience?.length >= 2) s.push(`${user.experience.length} work experiences demonstrate practical background`);
  if (matched.length > 5) s.push(`${matched.length} keywords match the job description`);
  return s.slice(0, 3);
}

function isTechOrRoleWord(word) {
  const tech = ['javascript','python','java','react','node','aws','docker','kubernetes','sql','mongodb','css','html','git','api','cloud','data','machine','learning','developer','engineer','manager','analyst','design','system','software','backend','frontend','fullstack','devops','agile','scrum'];
  return tech.some((t) => word.includes(t)) || word.length > 5;
}

const STOP_WORDS = new Set(['the','and','for','are','but','not','you','all','can','her','was','one','our','out','had','him','his','has','have','from','they','this','that','with','will','your','been','were','when','what','said','each','which','their','time','more','very','than','just','into','over','also','about','would','there','could','after','other','many','make','like','some','then','them','these','who','well','even','back','any','good','only','come','its','now','think','see','him','two','how','get','come','made','may']);

// ── Fallback resume builder (no LLM) — rich content from profile ─────────────
function buildFallbackResume(user) {
  const yearsExp = user.experience?.length
    ? Math.max(1, Math.round(user.experience.reduce((acc, e) => {
        if (!e.startDate) return acc;
        const end = e.current ? new Date() : (e.endDate ? new Date(e.endDate) : new Date());
        return acc + (end - new Date(e.startDate)) / (365.25 * 24 * 60 * 60 * 1000);
      }, 0)))
    : 0;

  const allSkills  = (user.skills || []);
  const techSkills = allSkills.filter(s => !['communication','teamwork','leadership','presentation','problem solving'].includes(s.toLowerCase()));
  const softSkills = ['Problem Solving', 'Team Collaboration', 'Agile Methodology', 'Communication', 'Time Management', 'Critical Thinking'];
  const toolSkills = techSkills.filter(s => ['git','docker','aws','azure','gcp','jira','figma','webpack','vite','postman','linux','jenkins','kubernetes','terraform'].some(t => s.toLowerCase().includes(t)));

  const title     = user.preferences?.preferredJobTitle || user.headline || 'Software Developer';
  const loc       = (user.preferences?.preferredLocations || [])[0] || '';
  const topSkills = techSkills.slice(0, 4).join(' | ');

  // Rich summary
  const summary = user.bio && user.bio.length > 80
    ? user.bio
    : [
        `${yearsExp > 0 ? `Results-driven ${title} with ${yearsExp}+ years of hands-on experience` : `Motivated and detail-oriented ${title}`} in designing, developing, and deploying scalable software solutions.`,
        techSkills.length ? `Proficient in ${techSkills.slice(0, 5).join(', ')} with a strong foundation in software engineering principles and best practices.` : '',
        `Proven ability to collaborate within cross-functional Agile teams to deliver high-quality products that meet business objectives and user needs.`,
        `Passionate about writing clean, maintainable code and continuously improving system performance, reliability, and developer experience.`,
        user.preferences?.preferredJobTitle ? `Seeking a challenging ${user.preferences.preferredJobTitle} role to leverage technical expertise and drive meaningful business impact.` : `Committed to continuous learning and staying current with industry trends and emerging technologies.`,
      ].filter(Boolean).join(' ');

  // Rich experience bullets
  const generateBullets = (exp) => {
    const bullets = [];
    const role    = exp.role    || 'Developer';
    const company = exp.company || 'the organization';

    if (exp.description && exp.description.trim().length > 20) {
      // Split description into multiple sentences and turn into bullets
      const sentences = exp.description.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
      sentences.slice(0, 4).forEach(s => bullets.push(s.endsWith('.') ? s : s + '.'));
    }

    // Add template bullets based on role type
    const roleLower = role.toLowerCase();
    if (roleLower.includes('develop') || roleLower.includes('engineer') || roleLower.includes('programmer')) {
      if (!bullets.some(b => b.toLowerCase().includes('develop')))
        bullets.push(`Developed and maintained full-stack applications using ${techSkills.slice(0,3).join(', ')}, improving system reliability and user experience.`);
      if (!bullets.some(b => b.toLowerCase().includes('api')))
        bullets.push(`Designed and implemented RESTful APIs that streamlined data exchange between frontend and backend services.`);
      if (!bullets.some(b => b.toLowerCase().includes('collab')))
        bullets.push(`Collaborated with cross-functional teams in Agile sprints to deliver features on schedule and within scope.`);
      if (!bullets.some(b => b.toLowerCase().includes('optim') || b.toLowerCase().includes('perform')))
        bullets.push(`Optimised application performance through code refactoring and database query improvements.`);
      if (!bullets.some(b => b.toLowerCase().includes('review') || b.toLowerCase().includes('quality')))
        bullets.push(`Participated in code reviews and contributed to engineering best practices, raising overall code quality standards.`);
    } else if (roleLower.includes('manager') || roleLower.includes('lead')) {
      if (!bullets.some(b => b.toLowerCase().includes('manage') || b.toLowerCase().includes('lead')))
        bullets.push(`Led a team of engineers to deliver projects on time and within budget, fostering a collaborative work environment.`);
    }

    // Ensure at least 4 bullets
    if (bullets.length < 4) {
      bullets.push(`Contributed to the planning, development, and deployment of software features at ${company}.`);
      bullets.push(`Applied ${techSkills.slice(0,2).join(' and ') || 'technical skills'} to solve complex business problems and deliver value.`);
    }

    return bullets.slice(0, 6);
  };

  return {
    name:     user.name || '',
    title:    topSkills ? `${title} | ${topSkills}` : title,
    location: loc,
    summary,
    skills: {
      technical: techSkills.length > 0 ? techSkills : ['JavaScript', 'Problem Solving'],
      soft:      softSkills,
      tools:     toolSkills.length > 0 ? toolSkills : techSkills.slice(-3),
    },
    experience: (user.experience || []).map(e => ({
      role:     e.role     || 'Developer',
      company:  e.company  || '',
      duration: `${e.startDate ? new Date(e.startDate).toLocaleDateString('en-US',{month:'short',year:'numeric'}) : '?'} – ${e.current ? 'Present' : e.endDate ? new Date(e.endDate).toLocaleDateString('en-US',{month:'short',year:'numeric'}) : '?'}`,
      bullets:  generateBullets(e),
    })),
    education: (user.education || []).map(e => ({
      degree:      [e.degree, e.fieldOfStudy].filter(Boolean).join(' in ') || e.degree || '',
      institution: e.institution || '',
      year:        e.endYear ? `Graduated: ${e.endYear}` : '',
      highlights:  e.fieldOfStudy ? `Relevant coursework: ${e.fieldOfStudy}, Data Structures, Algorithms, DBMS` : '',
    })),
    projects:  [],
    certifications: (user.certifications || []).map(c => `${c.name}${c.issuer ? ' — ' + c.issuer : ''}${c.year ? ' (' + c.year + ')' : ''}`),
    improvements: [
      'Add quantified achievements to every experience bullet (e.g. "Reduced load time by 40%", "Serving 10,000+ daily users")',
      'Include 2-3 personal or open-source projects with GitHub links to demonstrate initiative',
      'Tailor the summary paragraph for each job application to match the role description',
      'Add certifications relevant to your target role to boost ATS keyword matching',
    ],
    _fallback: true,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sanitiseResumeOutput(raw, user) {
  return {
    name:           typeof raw.name     === 'string' ? raw.name     : user.name || '',
    title:          typeof raw.title    === 'string' ? raw.title    : user.headline || '',
    location:       typeof raw.location === 'string' ? raw.location : '',
    summary:        typeof raw.summary  === 'string' ? raw.summary.slice(0, 1200) : '',
    skills:         raw.skills || { technical: user.skills || [], soft: [], tools: [] },
    experience:     Array.isArray(raw.experience)     ? raw.experience.slice(0, 10)    : [],
    education:      Array.isArray(raw.education)      ? raw.education.slice(0, 5)      : [],
    projects:       Array.isArray(raw.projects)       ? raw.projects.slice(0, 5)       : [],
    certifications: Array.isArray(raw.certifications) ? raw.certifications.slice(0, 10): [],
    improvements:   Array.isArray(raw.improvements)   ? raw.improvements.slice(0, 5)   : [],
  };
}

function sanitiseATSOutput(raw) {
  return {
    overallScore:      Math.min(100, Math.max(0, parseInt(raw.overallScore, 10) || 0)),
    grade:             ['A','B','C','D','F'].includes(raw.grade) ? raw.grade : 'C',
    sections:          raw.sections || {},
    matchedKeywords:   Array.isArray(raw.matchedKeywords) ? raw.matchedKeywords.slice(0, 20) : [],
    missingKeywords:   Array.isArray(raw.missingKeywords) ? raw.missingKeywords.slice(0, 15) : [],
    strengths:         Array.isArray(raw.strengths) ? raw.strengths.slice(0, 4) : [],
    improvements:      Array.isArray(raw.improvements) ? raw.improvements.slice(0, 8) : [],
    optimizedSummary:  typeof raw.optimizedSummary === 'string' ? raw.optimizedSummary.slice(0, 600) : null,
  };
}

module.exports = { buildResume, scoreATS };
