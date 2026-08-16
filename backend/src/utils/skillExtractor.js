const { SKILL_EXTRACT, SKILL_ALIASES } = require('./skills');
const { classifyJob } = require('./jobClassifier');

const normalize = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/[^\w+#.\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Strip boilerplate sections (EEO statements, benefits, diversity, about us)
const extractCoreRequirementsSection = (text) => {
  if (!text) return '';
  let cleaned = String(text)
    .replace(/(?:equal opportunity employer|eeo statement|we are an equal opportunity|we are proud to be an equal opportunity|diversity\s*(&|and)\s*inclusion|accommodations|benefits\s*(&|and)?\s*perks|what we offer|about (?:the )?company|about us)[\s\S]*$/i, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');

  const reqMatch = cleaned.match(/(?:requirements|qualifications|technical skills|key skills|tech stack|what you['']?ll need|what you bring|experience with|proficient in)[\s\S]{0,3000}/i);
  if (reqMatch) {
    return reqMatch[0];
  }

  return cleaned.slice(0, 4000);
};

// Explicit title-to-skills mappings for technical roles
const TECH_TITLE_SKILL_MAP = [
  { pattern: /\b(java\b|spring boot|spring mvc|j2ee|jvm)/i, skills: ['java', 'spring boot', 'sql', 'microservices'] },
  { pattern: /\b(mern|fullstack javascript|full-stack javascript)/i, skills: ['react', 'node.js', 'express', 'mongodb', 'javascript'] },
  { pattern: /\b(mean\b|mean stack)/i, skills: ['angular', 'node.js', 'express', 'mongodb', 'typescript'] },
  { pattern: /\b(react native|react-native)/i, skills: ['react native', 'react', 'javascript', 'mobile app development'] },
  { pattern: /\b(react|react\.js|reactjs|frontend developer|front-end developer|ui developer)/i, skills: ['react', 'javascript', 'html', 'css', 'typescript'] },
  { pattern: /\b(next\.js|nextjs)/i, skills: ['next.js', 'react', 'typescript', 'tailwind css'] },
  { pattern: /\b(angular|angularjs|angular\.js)/i, skills: ['angular', 'typescript', 'javascript', 'html'] },
  { pattern: /\b(vue|vue\.js|vuejs)/i, skills: ['vue', 'javascript', 'html', 'css'] },
  { pattern: /\b(node|nodejs|node\.js|backend developer|back-end developer)/i, skills: ['node.js', 'javascript', 'express', 'rest api', 'sql'] },
  { pattern: /\b(python|django|fastapi|flask)/i, skills: ['python', 'django', 'rest api', 'sql', 'postgresql'] },
  { pattern: /\b(golang|go developer|go engineer)/i, skills: ['go', 'microservices', 'docker', 'rest api'] },
  { pattern: /\b(c\+\+|cpp developer)/i, skills: ['c++', 'c', 'linux', 'multithreading'] },
  { pattern: /\b(c#|csharp|\.net|dotnet|asp\.net)/i, skills: ['c#', '.net', 'sql server', 'rest api'] },
  { pattern: /\b(php|laravel|symfony|codeigniter|wordpress)/i, skills: ['php', 'mysql', 'javascript', 'laravel'] },
  { pattern: /\b(ruby|ruby on rails|rails developer)/i, skills: ['ruby', 'ruby on rails', 'postgresql', 'rest api'] },
  { pattern: /\b(swift|ios developer|ios engineer)/i, skills: ['swift', 'ios', 'swiftui', 'xcode'] },
  { pattern: /\b(kotlin|android developer|android engineer)/i, skills: ['kotlin', 'android', 'android studio'] },
  { pattern: /\b(flutter|dart)/i, skills: ['flutter', 'dart', 'mobile app development'] },
  { pattern: /\b(devops|sre|site reliability|cloud engineer|cloud architect|infrastructure engineer)/i, skills: ['aws', 'docker', 'kubernetes', 'ci/cd', 'linux', 'terraform'] },
  { pattern: /\b(aws developer|aws engineer|aws cloud)/i, skills: ['aws', 'cloud computing', 'docker', 'ci/cd'] },
  { pattern: /\b(azure developer|azure engineer)/i, skills: ['azure', 'cloud computing', 'devops', 'ci/cd'] },
  { pattern: /\b(gcp engineer|google cloud)/i, skills: ['gcp', 'cloud computing', 'kubernetes', 'docker'] },
  { pattern: /\b(data scientist|machine learning|deep learning|ai engineer|ml engineer|nlp engineer|computer vision)/i, skills: ['python', 'machine learning', 'data science', 'sql', 'deep learning'] },
  { pattern: /\b(data engineer|big data|etl developer)/i, skills: ['python', 'sql', 'spark', 'etl', 'data warehousing'] },
  { pattern: /\b(data analyst|bi developer|business intelligence analyst)/i, skills: ['sql', 'data analysis', 'tableau', 'power bi', 'excel'] },
  { pattern: /\b(qa engineer|test engineer|software tester|sdet|automation tester|qa analyst)/i, skills: ['qa', 'test automation', 'selenium', 'jira'] },
  { pattern: /\b(cybersecurity|security engineer|infosec|soc analyst|penetration tester|ethical hacker)/i, skills: ['cybersecurity', 'network security', 'linux', 'vulnerability assessment'] },
  { pattern: /\b(ui\/ux|ux\/ui|product designer|ui designer|ux designer|interaction designer)/i, skills: ['ui/ux', 'figma', 'user research', 'wireframing', 'prototyping'] },
];

// Explicit title-to-skills mappings for non-technical roles
const NON_TECH_TITLE_SKILL_MAP = [
  { pattern: /\b(accountant|accounting|auditor|tax specialist|bookkeeper|tax consultant)/i, skills: ['accounting', 'financial reporting', 'taxation', 'bookkeeping', 'excel'] },
  { pattern: /\b(financial analyst|wealth manager|finance manager|finance lead|credit analyst)/i, skills: ['financial analysis', 'budgeting', 'financial modeling', 'forecasting', 'excel'] },
  { pattern: /\b(recruiter|recruitment|talent acquisition|sourcer|headhunter)/i, skills: ['talent acquisition', 'recruitment', 'candidate sourcing', 'screening', 'interviewing'] },
  { pattern: /\b(human resource|hr executive|hr manager|hr generalist|people ops|people operations)/i, skills: ['human resources', 'employee relations', 'people operations', 'onboarding', 'hr policies'] },
  { pattern: /\b(seo specialist|seo executive|seo manager|search engine optimization)/i, skills: ['seo', 'google analytics', 'keyword research', 'content optimization', 'sem'] },
  { pattern: /\b(social media manager|social media specialist|community manager)/i, skills: ['social media marketing', 'content creation', 'community management', 'brand awareness'] },
  { pattern: /\b(digital marketer|growth marketer|marketing manager|marketing specialist|marketing executive|brand manager)/i, skills: ['digital marketing', 'campaign management', 'content strategy', 'market research', 'brand management'] },
  { pattern: /\b(copywriter|content writer|content creator|technical writer|editor|journalist)/i, skills: ['content writing', 'copywriting', 'storytelling', 'proofreading', 'seo copywriting'] },
  { pattern: /\b(sales executive|sales representative|sales rep|sales manager|business development|bde|bdr|sdr|account executive)/i, skills: ['b2b sales', 'business development', 'lead generation', 'crm', 'client negotiation'] },
  { pattern: /\b(customer support|customer service|customer success|client support|client success|helpdesk)/i, skills: ['customer support', 'client communication', 'issue resolution', 'crm', 'customer satisfaction'] },
  { pattern: /\b(operations executive|operations lead|operations manager|business operations|bizops)/i, skills: ['operations management', 'process improvement', 'workflow optimization', 'project coordination', 'strategic planning'] },
  { pattern: /\b(program manager|programs manager|project manager|project coordinator)/i, skills: ['program management', 'project planning', 'stakeholder management', 'cross-functional leadership', 'process optimization'] },
  { pattern: /\b(creative producer|producer|art director|creative director|video editor|graphic designer)/i, skills: ['creative direction', 'visual design', 'media production', 'brand identity', 'project management'] },
  { pattern: /\b(legal counsel|attorney|lawyer|paralegal|compliance manager|compliance officer)/i, skills: ['legal compliance', 'contract negotiation', 'regulatory compliance', 'due diligence', 'corporate governance'] },
  { pattern: /\b(supply chain|logistics coordinator|procurement specialist|warehouse manager)/i, skills: ['supply chain management', 'logistics', 'vendor management', 'inventory control', 'procurement'] },
  { pattern: /\b(executive assistant|administrative assistant|office manager|receptionist)/i, skills: ['administrative support', 'calendar scheduling', 'office administration', 'executive communication'] },
  { pattern: /\b(teacher|instructor|trainer|tutor|professor|academic counselor)/i, skills: ['curriculum development', 'training & mentoring', 'instructional design', 'student engagement'] },
  { pattern: /\b(nurse|physician|medical assistant|pharmacist|clinical coordinator)/i, skills: ['patient care', 'clinical documentation', 'medical terminology', 'healthcare compliance'] },
];

const TECHNICAL_SKILL_SET = new Set([
  'java', 'python', 'javascript', 'typescript', 'react', 'react native', 'angular', 'vue',
  'next.js', 'node.js', 'express', 'django', 'fastapi', 'spring boot', 'c++', 'c#', '.net',
  'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'flutter', 'dart', 'sql', 'mongodb',
  'redis', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'devops', 'git', 'linux',
  'graphql', 'rest api', 'microservices', 'machine learning', 'deep learning', 'data science',
  'spark', 'tableau', 'power bi', 'qa', 'testing', 'selenium', 'cypress', 'ui/ux', 'figma',
  'cybersecurity', 'solidity', 'blockchain', 'mysql', 'postgresql', 'c', 'nosql', 'terraform',
]);

const extractSkills = (title = '', description = '', rawSkills = [], categoryHint = null) => {
  const scoredSkills = new Map();
  const cleanTitle = normalize(title);
  const coreDesc = extractCoreRequirementsSection(description);
  const cleanDesc = normalize(coreDesc);

  const category = categoryHint || (classifyJob(title, description).category);
  const isNonTechnical = category === 'non-technical';

  const addSkill = (skill, score) => {
    const canonical = SKILL_ALIASES[skill.toLowerCase().trim()] || skill.toLowerCase().trim();
    if (!canonical || canonical.length < 2) return;

    // Guard: Prevent assigning coding languages/technical skills to non-technical roles unless in title
    if (isNonTechnical && TECHNICAL_SKILL_SET.has(canonical)) {
      const escaped = canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const inTitle = new RegExp(`\\b${escaped}\\b`, 'i').test(cleanTitle);
      if (!inTitle) return;
    }

    const current = scoredSkills.get(canonical) || 0;
    scoredSkills.set(canonical, current + score);
  };

  // 1. Direct Pattern Match on Title (100 Weight)
  const patternList = isNonTechnical ? NON_TECH_TITLE_SKILL_MAP : TECH_TITLE_SKILL_MAP;
  patternList.forEach(({ pattern, skills }) => {
    if (pattern.test(cleanTitle)) {
      skills.forEach((s) => addSkill(s, 100));
    }
  });

  // Also check non-tech title patterns if tech role wasn't matched
  if (!isNonTechnical && scoredSkills.size === 0) {
    NON_TECH_TITLE_SKILL_MAP.forEach(({ pattern, skills }) => {
      if (pattern.test(cleanTitle)) {
        skills.forEach((s) => addSkill(s, 90));
      }
    });
  }

  // 2. Direct raw provider tags if available (80 Weight)
  if (Array.isArray(rawSkills) && rawSkills.length > 0) {
    rawSkills.forEach((tag) => {
      if (typeof tag === 'string' && tag.trim()) {
        addSkill(tag, 80);
      }
    });
  }

  // 3. Scan Requirements portion of Description
  Object.keys(SKILL_EXTRACT).forEach((skill) => {
    if (isNonTechnical && TECHNICAL_SKILL_SET.has(skill)) {
      return;
    }

    const aliases = SKILL_EXTRACT[skill];
    aliases.forEach((alias) => {
      const normAlias = normalize(alias);
      if (!normAlias) return;

      const escaped = normAlias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const titleRegex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (titleRegex.test(cleanTitle)) {
        addSkill(skill, 90);
        return;
      }

      if (normAlias.length <= 3) {
        const strictDescRegex = new RegExp(`(?:experience with|proficient in|knowledge of|using|stack|skills?|technologies?)[^.\\n]*?\\b${escaped}\\b`, 'i');
        if (strictDescRegex.test(cleanDesc)) {
          addSkill(skill, 40);
        }
        return;
      }

      const descRegex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (descRegex.test(cleanDesc)) {
        addSkill(skill, 30);
      }
    });
  });

  // Sort skills by score descending and return top 3-5
  const sorted = Array.from(scoredSkills.entries())
    .filter(([_, score]) => score >= 30)
    .sort((a, b) => b[1] - a[1])
    .map(([skill]) => skill);

  if (sorted.length === 0) {
    if (isNonTechnical) {
      return ['communication', 'problem solving', 'team leadership', 'strategic planning'];
    }
    return ['software engineering', 'problem solving', 'git', 'system architecture'];
  }

  return sorted.slice(0, 5);
};

module.exports = { extractSkills, normalize };
