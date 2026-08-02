/**
 * portfolioGenerator.service.js
 *
 * Generates a complete multi-file static website from the user's profile:
 *
 *   index.html   — full template structure (hero, about, experience, services,
 *                  skills, projects, modals, contact) referencing external assets
 *   style.css    — the existing style.css template (inlined from disk)
 *   script.js    — typing effect, parallax, counters, project modals, contact form
 *   favicon.svg  — generated brand favicon with user initials
 *   og-image.svg — generated OpenGraph share banner
 *
 * Returns { files, meta, content } where files is a flat map of
 * relative path → file content, ready for the deployment service to write.
 *
 * HTML generation NEVER fails — falls back to profile data with zero AI.
 */

const fs     = require('fs');
const path   = require('path');
const logger = require('../config/logger');
const { applyTheme } = require('./portfolioThemes');

// ── Load template files once at startup ────────────────────────────────────
// style.css and script.js live at the repo root (same folder as backend/)
// Path: backend/src/services/ → ../../.. → repo root
const TEMPLATE_DIR = path.resolve(__dirname, '..', '..', '..');

function loadFile(filename) {
  const p = path.join(TEMPLATE_DIR, filename);
  if (!fs.existsSync(p)) {
    // Fallback: try one level higher (local dev structure where workspace is nested)
    const p2 = path.join(path.resolve(__dirname, '..', '..', '..', '..'), filename);
    if (fs.existsSync(p2)) {
      logger.info(`[portfolio] Template found at fallback path: ${p2}`);
      return fs.readFileSync(p2, 'utf8');
    }
    logger.warn(`[portfolio] Template file not found at: ${p} or ${p2}`);
    return '';
  }
  logger.info(`[portfolio] Loaded ${filename} (${fs.statSync(p).size} bytes) from ${TEMPLATE_DIR}`);
  return fs.readFileSync(p, 'utf8');
}

const BASE_CSS = loadFile('style.css');
const BASE_JS  = loadFile('script.js');

// ── HTML escaping (XSS protection for user data) ────────────────────────────
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Skill icon mapping ──────────────────────────────────────────────────────
const SKILL_ICONS = {
  java: 'fa-brands fa-java', javascript: 'fa-brands fa-js', python: 'fa-brands fa-python',
  typescript: 'fa-brands fa-js', 'c++': 'fa-solid fa-c', 'c#': 'fa-solid fa-c',
  go: 'fa-brands fa-golang', ruby: 'fa-solid fa-gem', php: 'fa-brands fa-php',
  swift: 'fa-brands fa-swift', kotlin: 'fa-brands fa-kickstarter-k',
  react: 'fa-brands fa-react', 'react js': 'fa-brands fa-react',
  'node.js': 'fa-brands fa-node-js', nodejs: 'fa-brands fa-node-js',
  express: 'fa-solid fa-server', 'express.js': 'fa-solid fa-server',
  'spring boot': 'fa-solid fa-leaf', spring: 'fa-solid fa-leaf',
  angular: 'fa-brands fa-angular', vue: 'fa-brands fa-vuejs', 'vue.js': 'fa-brands fa-vuejs',
  django: 'fa-solid fa-leaf', flask: 'fa-solid fa-flask', laravel: 'fa-brands fa-laravel',
  'next.js': 'fa-solid fa-n', nextjs: 'fa-solid fa-n', 'tailwind css': 'fa-solid fa-wind',
  tailwind: 'fa-solid fa-wind', html: 'fa-brands fa-html5', css: 'fa-brands fa-css3-alt',
  aws: 'fa-brands fa-aws', 'amazon web services': 'fa-brands fa-aws', azure: 'fa-brands fa-microsoft',
  gcp: 'fa-brands fa-google', docker: 'fa-brands fa-docker', kubernetes: 'fa-solid fa-dharmachakra',
  jenkins: 'fa-brands fa-jenkins', 'ci/cd': 'fa-solid fa-network-wired', terraform: 'fa-solid fa-cubes',
  linux: 'fa-brands fa-linux', mysql: 'fa-solid fa-database', postgresql: 'fa-solid fa-database',
  mongodb: 'fa-solid fa-leaf', redis: 'fa-solid fa-bolt', sqlite: 'fa-solid fa-database',
  elasticsearch: 'fa-solid fa-magnifying-glass', git: 'fa-brands fa-git-alt',
  github: 'fa-brands fa-github', figma: 'fa-brands fa-figma', vscode: 'fa-solid fa-code',
  postman: 'fa-solid fa-paper-plane', jira: 'fa-brands fa-jira', slack: 'fa-brands fa-slack',
  tensorflow: 'fa-solid fa-brain', pytorch: 'fa-solid fa-fire', 'machine learning': 'fa-solid fa-robot',
  'deep learning': 'fa-solid fa-brain', 'artificial intelligence': 'fa-solid fa-robot',
  openai: 'fa-solid fa-robot', 'react native': 'fa-brands fa-react',
  flutter: 'fa-solid fa-mobile-screen', android: 'fa-brands fa-android', ios: 'fa-brands fa-apple',
  metasploit: 'fa-solid fa-shield-halved', 'network scanning': 'fa-solid fa-magnifying-glass',
  cybersecurity: 'fa-solid fa-shield-halved', penetration: 'fa-solid fa-bug',
  'rest api': 'fa-solid fa-plug', graphql: 'fa-solid fa-project-diagram', 'rest apis': 'fa-solid fa-plug',
  oops: 'fa-solid fa-cubes', dsa: 'fa-solid fa-code-branch', 'object oriented': 'fa-solid fa-cubes',
};

function getSkillIcon(skill) {
  const lower = skill.toLowerCase().trim();
  return SKILL_ICONS[lower] || 'fa-solid fa-code';
}

// ── Category detection ──────────────────────────────────────────────────────
const CATEGORY_RULES = [
  { title: 'DevOps & Cloud',     icon: 'fa-brands fa-aws',       keywords: ['aws', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'terraform', 'linux', 'azure', 'gcp', 'devops', 'cloud', 'ansible', 'nginx', 'grafana', 'prometheus'] },
  { title: 'Frontend',           icon: 'fa-brands fa-react',     keywords: ['react', 'angular', 'vue', 'nextjs', 'next.js', 'html', 'css', 'javascript', 'typescript', 'tailwind', 'sass', 'webpack', 'vite', 'svelte'] },
  { title: 'Backend',            icon: 'fa-solid fa-server',     keywords: ['java', 'spring', 'node', 'express', 'python', 'django', 'flask', 'php', 'laravel', 'go', 'ruby', 'rust', 'c#', '.net', 'fastapi'] },
  { title: 'Databases',          icon: 'fa-solid fa-database',   keywords: ['mysql', 'postgresql', 'mongodb', 'redis', 'sql', 'elasticsearch', 'dynamodb', 'cassandra', 'firebase', 'supabase'] },
  { title: 'AI & Machine Learning', icon: 'fa-solid fa-robot',   keywords: ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'ai', 'artificial intelligence', 'openai', 'nlp', 'llm', 'genai'] },
  { title: 'Security',           icon: 'fa-solid fa-shield-halved', keywords: ['security', 'cybersecurity', 'penetration', 'metasploit', 'network scanning', 'vulnerability', 'owasp'] },
  { title: 'Mobile',             icon: 'fa-solid fa-mobile-screen', keywords: ['react native', 'flutter', 'android', 'ios', 'swift', 'kotlin', 'dart'] },
  { title: 'Tools & Platforms',  icon: 'fa-solid fa-gear',       keywords: ['git', 'github', 'figma', 'vscode', 'postman', 'jira', 'slack'] },
  { title: 'Core Skills',        icon: 'fa-solid fa-code',       keywords: ['oops', 'dsa', 'data structures', 'algorithms', 'object oriented', 'rest api', 'graphql', 'testing'] },
];

function categorizeSkills(skills) {
  const categories = {};
  const uncategorized = [];

  for (const skill of skills) {
    const lower = skill.toLowerCase().trim();
    let placed = false;
    for (const rule of CATEGORY_RULES) {
      if (rule.keywords.some(kw => lower.includes(kw))) {
        if (!categories[rule.title]) categories[rule.title] = { title: rule.title, icon: rule.icon, skills: [] };
        categories[rule.title].skills.push(skill);
        placed = true;
        break;
      }
    }
    if (!placed) uncategorized.push(skill);
  }

  if (uncategorized.length > 0) {
    const miscKey = 'Other Skills';
    if (!categories[miscKey]) categories[miscKey] = { title: miscKey, icon: 'fa-solid fa-layer-group', skills: [] };
    categories[miscKey].skills.push(...uncategorized);
  }

  return categories;
}

// ── Profile → text for AI (optional enhancement) ────────────────────────────
function buildProfileSummary(user) {
  const lines = [`Name: ${user.name}`];
  if (user.headline) lines.push(`Headline: ${user.headline}`);
  if (user.email)    lines.push(`Email: ${user.email}`);
  if (user.phone)    lines.push(`Phone: ${user.phone}`);
  if (user.bio)      lines.push(`Bio: ${user.bio}`);
  if (user.skills?.length) lines.push(`Skills: ${user.skills.join(', ')}`);

  if (user.experience?.length) {
    lines.push('\nWork Experience:');
    user.experience.forEach(e => {
      const s = e.startDate ? new Date(e.startDate).getFullYear() : '';
      const en = e.current ? 'Present' : (e.endDate ? new Date(e.endDate).getFullYear() : '');
      lines.push(`  - ${e.role} at ${e.company} (${s}–${en})`);
      if (e.description) lines.push(`    ${e.description}`);
    });
  }
  if (user.education?.length) {
    lines.push('\nEducation:');
    user.education.forEach(e => lines.push(`  - ${e.degree}${e.fieldOfStudy ? ' in ' + e.fieldOfStudy : ''} at ${e.institution} (${e.startYear || ''}–${e.endYear || ''})`));
  }
  if (user.certifications?.length) {
    lines.push('\nCertifications:');
    user.certifications.forEach(c => lines.push(`  - ${c.name}${c.issuer ? ' by ' + c.issuer : ''}${c.year ? ' (' + c.year + ')' : ''}`));
  }
  if (user.socialLinks?.linkedin)  lines.push(`LinkedIn: ${user.socialLinks.linkedin}`);
  if (user.socialLinks?.github)    lines.push(`GitHub: ${user.socialLinks.github}`);
  if (user.socialLinks?.portfolio) lines.push(`Portfolio: ${user.socialLinks.portfolio}`);
  if (user.preferences?.preferredJobTitle) lines.push(`Target Role: ${user.preferences.preferredJobTitle}`);
  return lines.join('\n');
}

// ── Algorithmic fallback — works with zero AI ───────────────────────────────
function buildFallback(user) {
  const firstName = user.name?.split(' ')[0] || 'User';
  const lastName  = user.name?.split(' ').slice(1).join(' ') || '';
  const skills    = user.skills || [];
  const title     = user.preferences?.preferredJobTitle || user.headline || 'Software Developer';

  let yearsExp = 1;
  if (user.experience?.length) {
    let totalMs = 0;
    user.experience.forEach(e => {
      if (!e.startDate) return;
      const end = e.current ? Date.now() : (e.endDate ? new Date(e.endDate).getTime() : Date.now());
      totalMs += end - new Date(e.startDate).getTime();
    });
    yearsExp = Math.max(1, Math.round(totalMs / (365.25 * 24 * 60 * 60 * 1000)));
  }
  const projectCount = Math.max(3, (user.experience?.length || 0) * 3 + 2);

  return {
    name: user.name, firstName, lastName, title,
    email: user.email || '', phone: user.phone || '',
    location: (user.preferences?.preferredLocations || [])[0] || '',
    headline: user.headline || `${title} passionate about building great software.`,
    bio: user.bio || `${user.name} is a ${title} with expertise in ${skills.slice(0,3).join(', ') || 'software development'}. Passionate about delivering high-quality solutions.`,
    roles: [title, ...(user.experience?.slice(0,2).map(e => e.role) || [])].filter(Boolean).slice(0,3),
    stats: { experience: `${yearsExp}+`, projects: `${projectCount}+`, satisfaction: '100' },
    skills: categorizeSkills(skills.length > 0 ? skills : ['Problem Solving', 'Team Collaboration']),
    experience: (user.experience || []).map(e => ({
      role: e.role, company: e.company,
      duration: `${e.startDate ? new Date(e.startDate).getFullYear() : ''} – ${e.current ? 'Present' : (e.endDate ? new Date(e.endDate).getFullYear() : '')}`,
      description: e.description || `Worked as ${e.role} at ${e.company}.`,
      skills: [],
    })),
    education: (user.education || []).map(e => ({
      degree: e.degree, institution: e.institution,
      year: String(e.endYear || ''), field: e.fieldOfStudy || '',
    })),
    services: [
      { icon: 'fa-solid fa-code',       title: 'Development',      description: `Building robust ${title} solutions.` },
      { icon: 'fa-solid fa-mobile',     title: 'Responsive Design', description: 'Creating mobile-first experiences.' },
      { icon: 'fa-solid fa-database',   title: 'Data Management',   description: 'Designing scalable data solutions.' },
      { icon: 'fa-solid fa-chart-line', title: 'Consulting',        description: 'Technical advice and architecture reviews.' },
    ],
    projects: (user.experience || []).slice(0,3).map(e => ({
      title: e.company || 'Project',
      category: 'Work Project',
      description: e.description || `Contributed to ${e.role} work at ${e.company}.`,
      tags: skills.slice(0,3), url: '#',
    })),
    linkedin: user.socialLinks?.linkedin  || '',
    github:   user.socialLinks?.github    || '',
    portfolio:user.socialLinks?.portfolio || '',
    avatar:   user.avatar || '',
    metaDescription: `Portfolio of ${user.name} — ${title}`,
    metaKeywords: `${user.name}, ${title}, ${skills.slice(0,5).join(', ')}`,
    _fallback: true,
  };
}

// ── AI content generation (optional — fallback always works) ────────────────
const SYSTEM_PROMPT = `You are a professional portfolio content writer. Generate personalized portfolio content from the candidate profile. Return ONLY valid JSON — no markdown, no code fences, no explanation text.`;

async function tryAIContent(user) {
  try {
    const { generateJSON } = require('./aiProviders.service');
    const profile = buildProfileSummary(user);

    const userMessage = `Generate portfolio website content for this candidate and return ONLY JSON:

${profile}

Return exactly this JSON structure:
{
  "name": "Full Name",
  "firstName": "First",
  "lastName": "Last",
  "title": "Professional Title",
  "email": "email or empty",
  "phone": "phone or empty",
  "location": "City, Country or empty",
  "headline": "One punchy hero headline",
  "bio": "2-3 paragraph professional bio",
  "roles": ["Role 1", "Role 2", "Role 3"],
  "stats": { "experience": "X+", "projects": "XX+", "satisfaction": "100" },
  "skills": { "cat1": { "title": "Category", "icon": "fa-solid fa-code", "skills": ["S1","S2"] } },
  "experience": [{ "role": "Title", "company": "Company", "duration": "2022 – Present", "description": "Description.", "skills": ["S1"] }],
  "education": [{ "degree": "Degree", "institution": "University", "year": "2022", "field": "Field" }],
  "services": [{ "icon": "fa-solid fa-code", "title": "Service", "description": "Desc" }],
  "projects": [{ "title": "Project", "category": "Category", "description": "Desc.", "tags": ["T1"], "url": "#" }],
  "linkedin": "URL or empty",
  "github": "URL or empty",
  "portfolio": "URL or empty",
  "metaDescription": "SEO description max 150 chars",
  "metaKeywords": "keyword1, keyword2"
}`;

    const result = await generateJSON(SYSTEM_PROMPT, userMessage, 3000);
    if (result && result.name && result.bio && result.bio.length > 20) {
      logger.info('[portfolio] AI content generated successfully');
      return result;
    }
  } catch (err) {
    logger.warn('[portfolio] AI generation failed, using profile data', { message: err.message });
  }
  return null;
}

// ── Badge color mapping ─────────────────────────────────────────────────────
const BADGE_COLORS = {
  'devops & cloud':     { bg: 'rgba(255,150,50,0.15)',  border: 'rgba(255,150,50,0.4)',  text: '#ff9632' },
  'frontend':           { bg: 'rgba(97,218,251,0.15)',   border: 'rgba(97,218,251,0.4)',   text: '#61dafb' },
  'backend':            { bg: 'rgba(76,175,80,0.15)',    border: 'rgba(76,175,80,0.4)',    text: '#4caf50' },
  'databases':          { bg: 'rgba(156,39,176,0.15)',   border: 'rgba(156,39,176,0.4)',   text: '#9c27b0' },
  'ai & machine learning': { bg: 'rgba(255,106,0,0.15)', border: 'rgba(255,106,0,0.4)',    text: '#ff6a00' },
  'security':           { bg: 'rgba(244,67,54,0.15)',    border: 'rgba(244,67,54,0.4)',    text: '#f44336' },
  'mobile':             { bg: 'rgba(0,188,212,0.15)',    border: 'rgba(0,188,212,0.4)',    text: '#00bcd4' },
  'tools & platforms':  { bg: 'rgba(255,235,59,0.15)',   border: 'rgba(255,235,59,0.4)',   text: '#ffeb3b' },
  'core skills':        { bg: 'rgba(255,255,255,0.1)',   border: 'rgba(255,255,255,0.2)',  text: '#fff' },
  'other skills':       { bg: 'rgba(255,255,255,0.08)',  border: 'rgba(255,255,255,0.15)', text: '#ccc' },
};

function getBadgeStyle(categoryName) {
  const lower = categoryName.toLowerCase();
  for (const [key, style] of Object.entries(BADGE_COLORS)) {
    if (lower.includes(key)) return style;
  }
  return { bg: 'rgba(255,106,0,0.15)', border: 'rgba(255,106,0,0.4)', text: '#ff6a00' };
}

// ── Build index.html ────────────────────────────────────────────────────────
function buildHTML(c, themedCSS) {
  const css = themedCSS || BASE_CSS;
  const { name, firstName, lastName, title, email, phone, location, headline, bio,
    roles, stats, skills, experience, education, services, projects,
    linkedin, github, portfolio, metaDescription, metaKeywords, avatar } = c;

  // Make avatar URL absolute — local /uploads/ paths won't resolve from a subdomain
  const env = require('../config/env');
  const avatarUrl = avatar
    ? (avatar.startsWith('http') ? avatar : `${env.baseUrl.replace(/\/$/, '')}${avatar}`)
    : '';

  const expYears = stats?.experience?.match(/\d+/)?.[0] || 1;
  const projCount = stats?.projects?.match(/\d+/)?.[0] || 5;
  const satisfaction = stats?.satisfaction || '100';

  // ── Floating badges from top skill categories ────────────────────────────
  const topCategories = Object.values(skills || {}).slice(0, 4);
  const floatingBadgesHTML = topCategories.map((cat, i) => {
    const style = getBadgeStyle(cat.title);
    const posClass = ['badge-aws', 'badge-devops', 'badge-linux', 'badge-java'][i] || `badge-extra-${i}`;
    return `<div class="floating-badge ${posClass}" style="background:${style.bg};border-color:${style.border};color:${style.text}"><i class="${cat.icon}"></i> ${esc(cat.title)}</div>`;
  }).join('\n        ');

  // ── Skills categories HTML ───────────────────────────────────────────────
  const skillCatsHTML = Object.values(skills || {}).map(cat => `
          <div class="skill-category">
            <div class="skill-category-title">
              <i class="${cat.icon}"></i> ${esc(cat.title)}
            </div>
            <div class="skills-list">
              ${(cat.skills || []).filter(Boolean).map(s => `<div class="skill-tag"><i class="${getSkillIcon(s)}"></i> ${esc(s)}</div>`).join('\n              ')}
            </div>
          </div>`).join('\n');

  // ── Experience timeline HTML ─────────────────────────────────────────────
  const expHTML = (experience || []).map(e => `
        <div class="experience-card">
          <div class="experience-badge"><i class="fa-solid fa-briefcase"></i></div>
          <div class="experience-content">
            <div class="experience-header-row">
              <div>
                <h3 class="experience-role">${esc(e.role)}</h3>
                <div class="experience-company">${esc(e.company)}</div>
              </div>
              <div class="experience-duration">
                <span class="duration-pill"><i class="fa-regular fa-calendar"></i> ${esc(e.duration)}</span>
              </div>
            </div>
            <p class="experience-desc">${esc(e.description)}</p>
            <div class="experience-skills">
              ${(e.skills || []).map(s => `<span class="skill-mini-tag">${esc(s)}</span>`).join('')}
            </div>
          </div>
        </div>`).join('');

  // ── Education HTML ───────────────────────────────────────────────────────
  const eduHTML = (education || []).map(e => `
        <div class="experience-card">
          <div class="experience-badge"><i class="fa-solid fa-graduation-cap"></i></div>
          <div class="experience-content">
            <div class="experience-header-row">
              <div>
                <h3 class="experience-role">${esc(e.degree)}${e.field ? ' in ' + esc(e.field) : ''}</h3>
                <div class="experience-company">${esc(e.institution)}</div>
              </div>
              <div class="experience-duration">
                <span class="duration-pill"><i class="fa-regular fa-calendar"></i> ${esc(e.year)}</span>
              </div>
            </div>
          </div>
        </div>`).join('');

  // ── Services HTML ────────────────────────────────────────────────────────
  const servicesHTML = (services || []).map(s => `
        <div class="service-card">
          <div class="service-icon"><i class="${s.icon}"></i></div>
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.description)}</p>
        </div>`).join('');

  // ── Projects HTML ────────────────────────────────────────────────────────
  const projectIds = (projects || []).map((_, i) => `proj_${i}`);
  const projectsHTML = (projects || []).map((p, i) => `
        <div class="project-card" onclick="openProjectModal('${projectIds[i]}')">
          <div class="project-browser-frame">
            <div class="browser-dots"><span></span><span></span><span></span></div>
            <div class="browser-address-bar">
              <i class="fa-solid fa-lock"></i> ${esc(p.url && p.url !== '#' ? p.url.replace(/https?:\/\//, '') : 'project')}
            </div>
          </div>
          <div class="project-card-body">
            <div class="project-client-tag">${esc(p.category)}</div>
            <h3 class="project-title">${esc(p.title)}</h3>
            <p class="project-snippet">${esc(p.description)}</p>
            <div class="project-tags">
              ${(p.tags || []).map(t => `<span>${esc(t)}</span>`).join('')}
            </div>
            ${p.url && p.url !== '#' ? `<div class="project-footer-action"><a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer" class="more-details-link">View Project <i class="fa-solid fa-arrow-right"></i></a></div>` : `<div class="project-footer-action"><span class="more-details-link">More Details <i class="fa-solid fa-arrow-right"></i></span></div>`}
          </div>
        </div>`).join('');

  // ── Skills intro text ────────────────────────────────────────────────────
  const skillCatNames = Object.values(skills || {}).map(c => c.title).slice(0, 4).join(', ');
  const skillsIntroText = Object.values(skills || {}).reduce((acc, cat) => acc + (cat.skills || []).length, 0);

  // ── About highlights (first 2 services) ──────────────────────────────────
  const aboutHighlightsHTML = (services || []).slice(0, 2).map(s => `
            <div class="highlight-box">
              <div class="highlight-icon"><i class="${s.icon}"></i></div>
              <h4>${esc(s.title)}</h4>
              <p>${esc(s.description)}</p>
            </div>`).join('');

  // ── JSON-LD structured data ──────────────────────────────────────────────
  const jsonLD = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "name": name,
        "givenName": firstName,
        "familyName": lastName,
        "jobTitle": roles?.length ? roles : [title || 'Developer'],
        "description": bio || `Portfolio of ${name}`,
        "email": email || undefined,
        "telephone": phone || undefined,
        "url": portfolio || undefined,
        "address": location ? { "@type": "PostalAddress", "addressLocality": location, "addressCountry": "IN" } : undefined,
        "knowsAbout": Object.values(skills || {}).flatMap(c => c.skills || []).slice(0, 20),
        "sameAs": [linkedin, github, portfolio].filter(Boolean),
      },
      {
        "@type": "WebSite",
        "name": `${name} — Portfolio`,
        "description": metaDescription || `Portfolio of ${name}`,
        "inLanguage": "en",
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="apple-touch-icon" href="favicon.svg">
  <title>${esc(name)} | ${esc(title)}</title>
  <meta name="title" content="${esc(name)} | ${esc(title)}">
  <meta name="description" content="${esc(metaDescription || `Portfolio of ${name}`)}">
  <meta name="keywords" content="${esc(metaKeywords || name)}">
  <meta name="author" content="${esc(name)}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="googlebot" content="index, follow">
  <meta name="language" content="English">
  ${location ? `<meta name="geo.region" content="IN">
  <meta name="geo.placename" content="${esc(location)}">` : ''}

  <meta property="og:type" content="profile">
  <meta property="og:title" content="${esc(name)} | ${esc(title)}">
  <meta property="og:description" content="${esc(metaDescription || `Portfolio of ${name}`)}">
  <meta property="og:site_name" content="${esc(name)} Portfolio">
  <meta property="og:locale" content="en_IN">
  <meta property="og:image" content="og-image.svg">
  ${portfolio ? `<meta property="og:url" content="${esc(portfolio)}">` : ''}
  <meta property="profile:first_name" content="${esc(firstName)}">
  <meta property="profile:last_name" content="${esc(lastName)}">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(name)} | ${esc(title)}">
  <meta name="twitter:description" content="${esc(metaDescription || `Portfolio of ${name}`)}">
  <meta name="twitter:image" content="og-image.svg">

  <script type="application/ld+json">
  ${JSON.stringify(jsonLD, null, 2)}
  </script>

  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
${css}
  </style>
</head>
<body>

  <div class="parallax-bg">
    <div class="glow-orb orb-1" id="orb1"></div>
    <div class="glow-orb orb-2" id="orb2"></div>
    <div class="glow-orb orb-3" id="orb3"></div>
  </div>

  <header>
    <div class="nav-container">
      <a href="#home" class="logo">${esc(firstName || '').toUpperCase()}<span> ${esc(lastName || '').toUpperCase()}</span></a>
      <nav>
        <ul class="nav-menu" id="nav-menu">
          <li><a href="#home" class="nav-link active">Home</a></li>
          <li><a href="#about" class="nav-link">About me</a></li>
          <li><a href="#experience" class="nav-link">Experience</a></li>
          <li><a href="#services" class="nav-link">Services</a></li>
          <li><a href="#skills" class="nav-link">Skills</a></li>
          <li><a href="#projects" class="nav-link">Projects</a></li>
          <li><a href="#contact" class="nav-link">Contact me</a></li>
        </ul>
      </nav>
      <a href="#contact" class="btn btn-primary nav-btn">Hire Me</a>
      <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>

  <section class="hero" id="home">
    <div class="hero-content reveal">
      <p class="hero-subtitle">Hi I am</p>
      <h1 class="hero-title">${esc(name)}</h1>
      <div class="hero-role-wrapper">
        <span class="hero-role" id="typing-text"></span>
      </div>
      <div class="hero-socials">
        ${email ? `<a href="mailto:${esc(email)}" class="social-icon" title="Email"><i class="fa-solid fa-envelope"></i></a>` : ''}
        ${phone ? `<a href="tel:${esc(phone)}" class="social-icon" title="Call"><i class="fa-solid fa-phone"></i></a>` : ''}
        ${linkedin ? `<a href="${esc(linkedin)}" class="social-icon" target="_blank" title="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>` : ''}
        ${github ? `<a href="${esc(github)}" class="social-icon" target="_blank" title="GitHub"><i class="fa-brands fa-github"></i></a>` : ''}
      </div>
      <div class="hero-ctas">
        <a href="#contact" class="btn btn-primary">Hire Me <i class="fa-solid fa-arrow-right"></i></a>
        <a href="#projects" class="btn btn-secondary">View Work <i class="fa-solid fa-eye"></i></a>
      </div>
      <div class="hero-stats">
        <div class="stat-item">
          <span class="stat-number" data-target="${expYears}">0</span><span class="stat-plus">+</span>
          <span class="stat-label">Years Experience</span>
        </div>
        <div class="stat-item">
          <span class="stat-number" data-target="${projCount}">0</span><span class="stat-plus">+</span>
          <span class="stat-label">Projects Done</span>
        </div>
        <div class="stat-item">
          <span class="stat-number" data-target="${satisfaction}">0</span><span class="stat-plus">%</span>
          <span class="stat-label">Client Satisfaction</span>
        </div>
      </div>
    </div>

    <div class="hero-image-container reveal">
      <div class="hero-3d-stage" id="hero-3d-stage">
        ${floatingBadgesHTML}
        ${avatarUrl ? `
        <div class="profile-avatar-wrap">
          <div class="profile-avatar-ring"></div>
          <img src="${esc(avatarUrl)}" alt="${esc(name)}" class="profile-avatar-img" loading="lazy" onerror="this.parentElement.style.display='none'">
        </div>` : `
        <div class="profile-avatar-placeholder">
          <i class="fa-solid fa-user"></i>
        </div>`}
        <div class="stage-ground-3d"></div>
      </div>
    </div>
  </section>

  <section id="about" class="reveal">
    <div class="section-header">
      <span class="section-tag">Biography</span>
      <h2 class="section-title">About Me</h2>
    </div>
    <div class="about-grid">
      <div class="about-text" style="grid-column:1/-1;max-width:800px;margin:0 auto;">
        <h3>${esc(headline || '')}</h3>
        ${(bio || '').split('\n').filter(p => p.trim()).map(p => `<p>${esc(p)}</p>`).join('')}
        <div class="about-highlights">
          ${aboutHighlightsHTML}
        </div>
      </div>
    </div>
  </section>

  <section id="experience" class="reveal">
    <div class="section-header">
      <span class="section-tag">Work History</span>
      <h2 class="section-title">Experience</h2>
    </div>
    <div class="experience-timeline">
      ${expHTML || '<p style="color:var(--text-secondary);text-align:center">Add work experience to your profile</p>'}
    </div>
  </section>

  ${eduHTML ? `<section id="education" class="reveal">
    <div class="section-header">
      <span class="section-tag">Learning</span>
      <h2 class="section-title">Education</h2>
    </div>
    <div class="experience-timeline">${eduHTML}</div>
  </section>` : ''}

  <section id="services" class="reveal">
    <div class="section-header">
      <span class="section-tag">Services</span>
      <h2 class="section-title">What I Do</h2>
    </div>
    <div class="services-grid">${servicesHTML}</div>
  </section>

  <section id="skills" class="reveal">
    <div class="section-header">
      <span class="section-tag">Tech Stack</span>
      <h2 class="section-title">Skills &amp; Expertise</h2>
    </div>
    <div class="skills-container">
      <div class="skills-intro">
        <h3>Core Technical Stack & Engineering Foundations</h3>
        <p>Proficient across ${esc(skillCatNames || 'multiple technology domains')} with ${skillsIntroText}+ tools and frameworks in the toolkit.</p>
      </div>
      <div class="skills-categories">
        ${skillCatsHTML}
      </div>
    </div>
  </section>

  ${projectsHTML ? `<section id="projects" class="reveal">
    <div class="section-header">
      <span class="section-tag">Portfolio</span>
      <h2 class="section-title">Featured Projects</h2>
    </div>
    <div class="projects-grid">${projectsHTML}</div>
  </section>` : ''}

  <section id="contact" class="reveal">
    <div class="section-header">
      <span class="section-tag">Get In Touch</span>
      <h2 class="section-title">Contact Me</h2>
    </div>
    <div class="contact-grid">
      <div class="contact-info">
        ${phone ? `<div class="contact-card"><div class="contact-icon"><i class="fa-solid fa-phone"></i></div><div class="contact-details"><h4>Phone</h4><p><a href="tel:${esc(phone)}">${esc(phone)}</a></p></div></div>` : ''}
        ${email ? `<div class="contact-card"><div class="contact-icon"><i class="fa-solid fa-envelope"></i></div><div class="contact-details"><h4>Email</h4><p><a href="mailto:${esc(email)}">${esc(email)}</a></p></div></div>` : ''}
        ${location ? `<div class="contact-card"><div class="contact-icon"><i class="fa-solid fa-location-dot"></i></div><div class="contact-details"><h4>Location</h4><p>${esc(location)}</p></div></div>` : ''}
      </div>
      <div class="contact-form-container">
        <form id="contactForm" onsubmit="handleFormSubmit(event)">
          <div class="form-group-row">
            <div class="form-group"><input type="text" class="form-control" placeholder="Your Name" required></div>
            <div class="form-group"><input type="email" class="form-control" placeholder="Your Email" required></div>
          </div>
          <div class="form-group"><input type="text" class="form-control" placeholder="Subject" required></div>
          <div class="form-group"><textarea class="form-control" placeholder="Your Message" required></textarea></div>
          <button type="submit" class="btn btn-primary" style="width:100%">Send Message <i class="fa-solid fa-paper-plane"></i></button>
        </form>
      </div>
    </div>
  </section>

  <footer>
    <div class="footer-content">
      <div class="footer-text">
        &copy; <span id="year"></span> <strong>${esc(name)}</strong>. All Rights Reserved.
      </div>
      <div class="footer-socials">
        ${email ? `<a href="mailto:${esc(email)}" class="social-icon" title="Email"><i class="fa-solid fa-envelope"></i></a>` : ''}
        ${phone ? `<a href="tel:${esc(phone)}" class="social-icon" title="Phone"><i class="fa-solid fa-phone"></i></a>` : ''}
        ${github ? `<a href="${esc(github)}" class="social-icon" target="_blank" title="GitHub"><i class="fa-brands fa-github"></i></a>` : ''}
        ${linkedin ? `<a href="${esc(linkedin)}" class="social-icon" target="_blank" title="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>` : ''}
      </div>
    </div>
  </footer>

  <div class="project-modal" id="projectModal">
    <div class="modal-dialog">
      <button class="modal-close" onclick="closeProjectModal()">&times;</button>
      <div class="modal-body" id="modalBody"></div>
    </div>
  </div>

  <script>
${buildJS(c)}
  </script>
</body>
</html>`;
}

// ── Build script.js ─────────────────────────────────────────────────────────
// Prefers the user's template script.js (BASE_JS) with the current profile's
// roles + projects injected. Falls back to a fully generated script if the
// template file is missing.
function buildJS(c) {
  const { roles, title, projects } = c;
  const rolesJS = JSON.stringify(roles?.length ? roles : [title || 'Developer']);

  const projectIds = (projects || []).map((_, i) => `proj_${i}`);
  const projectDataJS = JSON.stringify(
    Object.fromEntries((projects || []).map((p, i) => [projectIds[i], {
      title: p.title,
      clientTag: p.category,
      url: p.url || '#',
      imageSrc: p.imageSrc || 'data:image/svg+xml;utf8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="420">' +
        '<rect width="800" height="420" fill="#12121f"/>' +
        '<circle cx="650" cy="90" r="140" fill="rgba(255,106,0,0.15)"/>' +
        '<text x="60" y="220" font-family="Arial" font-size="36" font-weight="bold" fill="#fff">' + (p.title || 'Project') + '</text>' +
        '<text x="60" y="280" font-family="Arial" font-size="20" fill="#ffb347">' + (p.category || '') + '</text>' +
        '</svg>'
      ),
      category: p.category,
      description: p.description,
      features: (p.tags || []).map(t => `Built with ${t}`),
      techStack: p.tags || [],
    }]))
  );

  if (BASE_JS) {
    let js = BASE_JS;
    const rolesRe = /const roles\s*=\s*\[[\s\S]*?\];/;
    if (!rolesRe.test(js)) return buildJSGenerated(c, rolesJS, projectDataJS);
    js = js.replace(rolesRe, 'const roles = ' + rolesJS + ';');

    const dataRe = /const projectData\s*=\s*\{[\s\S]*?\n\};/;
    if (!dataRe.test(js)) return buildJSGenerated(c, rolesJS, projectDataJS);
    js = js.replace(dataRe, 'const projectData = ' + projectDataJS + ';');

    return js;
  }

  return buildJSGenerated(c, rolesJS, projectDataJS);
}

function buildJSGenerated(c, rolesJS, projectDataJS) {
  return `(function () {
  'use strict';

  const _ROLES = ${rolesJS};
  const projectData = ${projectDataJS};

  document.addEventListener('DOMContentLoaded', () => {
    // Typing effect
    const typingText = document.getElementById('typing-text');
    let ri = 0, ci = 0, del = false, ts = 100;
    function type() {
      const cur = _ROLES[ri] || '';
      typingText.textContent = del ? cur.substring(0, ci - 1) : cur.substring(0, ci + 1);
      if (del) { ci--; ts = 50; } else { ci++; ts = 100; }
      if (!del && ci === cur.length) { del = true; ts = 2000; }
      else if (del && ci === 0) { del = false; ri = (ri + 1) % _ROLES.length; ts = 500; }
      setTimeout(type, ts);
    }
    if (typingText && _ROLES.length) type();

    // Scroll reveal + counters
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('active');
          e.target.querySelectorAll('.stat-number').forEach(c => {
            const t = +c.getAttribute('data-target');
            let v = 0;
            const inc = t / 60;
            const tmr = setInterval(() => {
              v += inc;
              if (v >= t) { c.textContent = t; clearInterval(tmr); } else c.textContent = Math.ceil(v);
            }, 30);
          });
        }
      });
    }, { threshold: 0.05 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

    // Mobile nav
    const tog = document.getElementById('nav-toggle'), men = document.getElementById('nav-menu');
    if (tog && men) {
      tog.addEventListener('click', () => { tog.classList.toggle('open'); men.classList.toggle('open'); });
      men.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => { tog.classList.remove('open'); men.classList.remove('open'); }));
    }

    // Year
    const yr = document.getElementById('year');
    if (yr) yr.textContent = new Date().getFullYear();

    // 3D parallax — orbs only, stage stays static
    const o1 = document.getElementById('orb1'), o2 = document.getElementById('orb2'), o3 = document.getElementById('orb3');
    window.addEventListener('mousemove', e => {
      const mx = e.clientX / window.innerWidth - 0.5, my = e.clientY / window.innerHeight - 0.5;
      if (o1) o1.style.transform = \`translate(\${mx * 40}px, \${my * 40}px)\`;
      if (o2) o2.style.transform = \`translate(\${mx * -30}px, \${my * -30}px)\`;
      if (o3) o3.style.transform = \`translate(\${mx * 20}px, \${my * -20}px)\`;
    });

    // Active nav on scroll
    window.addEventListener('scroll', () => {
      const secs = document.querySelectorAll('section'), lnks = document.querySelectorAll('.nav-link');
      let cur = '';
      secs.forEach(s => { if (window.scrollY >= s.offsetTop - 150) cur = s.id; });
      lnks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + cur));
    });
  });

  // Project modal
  window.openProjectModal = function (id) {
    const modal = document.getElementById('projectModal'), body = document.getElementById('modalBody'), p = projectData[id];
    if (!p) return;
    const techBadge = (p.techStack || []).map(t => '<span class="skill-tag" style="font-size:0.8rem;padding:6px 14px;">' + t + '</span>').join('');
    const features = (p.features || []).map(f => '<li><i class="fa-solid fa-check-circle"></i> <span>' + f + '</span></li>').join('');
    body.innerHTML = [
      '<h2 class="modal-title">' + p.title + '</h2>',
      '<p class="modal-subtitle"><i class="fa-solid fa-tag"></i> ' + (p.clientTag || p.category) + '</p>',
      '<div class="modal-section-title">Overview</div>',
      '<p style="color:var(--text-secondary);line-height:1.6;margin-bottom:20px">' + p.description + '</p>',
      '<div class="modal-section-title">Key Highlights</div>',
      '<ul class="modal-features-list">' + features + '</ul>',
      '<div class="modal-section-title">Technology Stack</div>',
      '<div class="skills-list" style="margin-bottom:24px">' + techBadge + '</div>',
      '<div class="modal-actions">',
      (p.url && p.url !== '#' ? '<a href="' + p.url + '" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Visit Live Website <i class="fa-solid fa-arrow-up-right-from-square"></i></a>' : ''),
      '<button class="btn btn-secondary" onclick="closeProjectModal()">Close</button>',
      '</div>'
    ].join('');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeProjectModal = function () {
    const m = document.getElementById('projectModal');
    if (m) { m.classList.remove('active'); document.body.style.overflow = ''; }
  };

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeProjectModal(); });
  document.addEventListener('click', e => { if (e.target === document.getElementById('projectModal')) closeProjectModal(); });

  // Contact form
  window.handleFormSubmit = function (e) {
    e.preventDefault();
    const f = e.target, b = f.querySelector('button[type="submit"]');
    const orig = b.innerHTML;
    b.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
    b.disabled = true;
    setTimeout(() => {
      b.innerHTML = 'Message Sent! <i class="fa-solid fa-check"></i>';
      b.style.background = '#28a745';
      f.reset();
      setTimeout(() => { b.innerHTML = orig; b.style.background = ''; b.disabled = false; }, 3000);
    }, 1200);
  };
})();`;
}
// ── Build favicon.svg ───────────────────────────────────────────────────────
function buildFavicon(c) {
  const { firstName, lastName } = c;
  const initials = (firstName?.[0] || '') + (lastName?.[0] || '');
  const text = (initials || c.name?.[0] || 'P').toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff6a00"/>
      <stop offset="100%" stop-color="#ffb347"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#g)"/>
  <text x="32" y="41" font-family="Arial, sans-serif" font-size="26" font-weight="bold" fill="#ffffff" text-anchor="middle">${esc(text)}</text>
</svg>`;
}

// ── Build og-image.svg (OpenGraph share banner) ─────────────────────────────
function buildOGImage(c) {
  const { name, title } = c;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f0f17"/>
      <stop offset="100%" stop-color="#1a1a2e"/>
    </linearGradient>
    <linearGradient id="acc" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ff6a00"/>
      <stop offset="100%" stop-color="#ffb347"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1050" cy="120" r="200" fill="rgba(255,106,0,0.12)"/>
  <circle cx="150" cy="520" r="260" fill="rgba(255,106,0,0.08)"/>
  <rect x="80" y="90" width="72" height="8" rx="4" fill="url(#acc)"/>
  <text x="80" y="240" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="#ffffff">${esc(name)}</text>
  <text x="80" y="310" font-family="Arial, sans-serif" font-size="34" fill="#ffb347">${esc(title || '')}</text>
  <text x="80" y="560" font-family="Arial, sans-serif" font-size="22" fill="#8b8ba7">Personal Portfolio &bull; Built with JobHive</text>
</svg>`;
}

// ── Main export — generates a complete multi-file website ───────────────────
async function generatePortfolioSite(user, theme = 'dark-orange') {
  logger.info(`[portfolio] Generating site for: ${user.name} (theme: ${theme})`);

  // Profile data fallback (always works), AI enhancement optional
  let content = buildFallback(user);
  try {
    const aiContent = await tryAIContent(user);
    if (aiContent) {
      // AI doesn't know the avatar URL — always carry it from the real user object
      content = { ...aiContent, avatar: user.avatar || '' };
    }
  } catch (err) {
    logger.warn('[portfolio] AI skipped', { message: err.message });
  }

  // Apply theme to CSS before embedding
  const themedCSS = applyTheme(BASE_CSS, theme);

  const files = {
    'index.html':   buildHTML(content, themedCSS),
    'style.css':    themedCSS,
    'script.js':    buildJS(content),
    'favicon.svg':  buildFavicon(content),
    'og-image.svg': buildOGImage(content),
  };

  const meta = {
    title:       `${content.name} | ${content.title}`,
    description: content.metaDescription || `Portfolio of ${content.name}`,
    name:        content.name,
  };

  return { files, meta, content };
}

// ── Backwards-compatible single-HTML export (legacy consumers) ──────────────
function buildSingleHTML(c) {
  return buildHTML(c);
}

async function generatePortfolio(user) {
  const { files, meta, content } = await generatePortfolioSite(user);
  return { html: files['index.html'], filename: `${user.name || 'portfolio'}-portfolio.html`, content };
}

module.exports = { generatePortfolio, generatePortfolioSite };
