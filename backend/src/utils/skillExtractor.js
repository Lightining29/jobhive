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

// Strip boilerplate sections (EEO statements, benefits, diversity, about us) that pollute skills
const extractCoreRequirementsSection = (text) => {
  if (!text) return '';
  // 1. Remove trailing boilerplate / EEO / perks / about us sections
  let cleaned = String(text)
    .replace(/(?:equal opportunity employer|eeo statement|we are an equal opportunity|we are proud to be an equal opportunity|diversity\s*(&|and)\s*inclusion|accommodations|benefits\s*(&|and)?\s*perks|what we offer|about (?:the )?company|about us)[\s\S]*$/i, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');

  // 2. Try to isolate requirements / tech stack section if available
  const reqMatch = cleaned.match(/(?:requirements|qualifications|technical skills|key skills|tech stack|what you['']?ll need|what you bring|experience with|proficient in)[\s\S]{0,3000}/i);
  if (reqMatch) {
    return reqMatch[0];
  }

  return cleaned.slice(0, 4000);
};

// Explicit title-to-skills mappings for highest accuracy
const TITLE_SKILL_MAP = [
  { pattern: /\b(java\b|spring boot|spring mvc|j2ee|jvm)/i, skills: ['java', 'spring boot', 'sql'] },
  { pattern: /\b(mern|fullstack javascript|full-stack javascript)/i, skills: ['react', 'node.js', 'express', 'mongodb', 'javascript'] },
  { pattern: /\b(mean\b|mean stack)/i, skills: ['angular', 'node.js', 'express', 'mongodb', 'typescript'] },
  { pattern: /\b(react native|react-native)/i, skills: ['react native', 'react', 'javascript', 'mobile'] },
  { pattern: /\b(react|react\.js|reactjs|frontend developer|front-end developer|ui developer)/i, skills: ['react', 'javascript', 'html', 'css'] },
  { pattern: /\b(next\.js|nextjs)/i, skills: ['next.js', 'react', 'typescript'] },
  { pattern: /\b(angular|angularjs|angular\.js)/i, skills: ['angular', 'typescript', 'javascript'] },
  { pattern: /\b(vue|vue\.js|vuejs)/i, skills: ['vue', 'javascript', 'html', 'css'] },
  { pattern: /\b(node|nodejs|node\.js|backend developer|back-end developer)/i, skills: ['node.js', 'javascript', 'express', 'rest api', 'sql'] },
  { pattern: /\b(python|django|fastapi|flask)/i, skills: ['python', 'django', 'rest api', 'sql'] },
  { pattern: /\b(golang|go developer|go engineer)/i, skills: ['go', 'microservices', 'docker', 'rest api'] },
  { pattern: /\b(c\+\+|cpp developer)/i, skills: ['c++', 'c', 'linux'] },
  { pattern: /\b(c#|csharp|\.net|dotnet|asp\.net)/i, skills: ['c#', '.net', 'sql'] },
  { pattern: /\b(php|laravel|symfony|codeigniter|wordpress)/i, skills: ['php', 'mysql', 'javascript'] },
  { pattern: /\b(ruby|ruby on rails|rails developer)/i, skills: ['ruby', 'postgresql', 'rest api'] },
  { pattern: /\b(swift|ios developer|ios engineer)/i, skills: ['swift', 'ios'] },
  { pattern: /\b(kotlin|android developer|android engineer)/i, skills: ['kotlin', 'android'] },
  { pattern: /\b(flutter|dart)/i, skills: ['flutter', 'dart', 'mobile'] },
  { pattern: /\b(devops|sre|site reliability|cloud engineer|cloud architect|infrastructure engineer)/i, skills: ['aws', 'docker', 'kubernetes', 'ci/cd', 'linux', 'terraform'] },
  { pattern: /\b(aws developer|aws engineer|aws cloud)/i, skills: ['aws', 'cloud', 'docker', 'ci/cd'] },
  { pattern: /\b(azure developer|azure engineer)/i, skills: ['azure', 'cloud', 'devops'] },
  { pattern: /\b(gcp engineer|google cloud)/i, skills: ['gcp', 'cloud', 'kubernetes'] },
  { pattern: /\b(data scientist|machine learning|deep learning|ai engineer|ml engineer|nlp engineer|computer vision)/i, skills: ['python', 'machine learning', 'data science', 'sql', 'deep learning'] },
  { pattern: /\b(data engineer|big data|etl developer)/i, skills: ['python', 'sql', 'spark', 'etl', 'data engineering'] },
  { pattern: /\b(data analyst|bi developer|business intelligence analyst)/i, skills: ['sql', 'data analysis', 'tableau', 'power bi', 'excel'] },
  { pattern: /\b(qa engineer|test engineer|software tester|sdet|automation tester|qa analyst)/i, skills: ['qa', 'testing', 'automation testing', 'selenium'] },
  { pattern: /\b(cybersecurity|security engineer|infosec|soc analyst|penetration tester|ethical hacker)/i, skills: ['cybersecurity', 'network security', 'linux', 'security'] },
  { pattern: /\b(ui\/ux|ux\/ui|product designer|ui designer|ux designer|interaction designer)/i, skills: ['ui/ux', 'figma', 'user research', 'prototyping'] },
  { pattern: /\b(accountant|accounting|financial analyst|auditor|tax specialist|bookkeeper)/i, skills: ['accounting', 'financial analysis', 'excel', 'taxation', 'bookkeeping'] },
  { pattern: /\b(recruiter|recruitment|talent acquisition|human resource|hr executive|hr manager|people ops)/i, skills: ['hr', 'talent acquisition', 'recruitment', 'people operations', 'screening'] },
  { pattern: /\b(seo specialist|seo executive|seo manager|digital marketer|growth marketer|content marketing)/i, skills: ['seo', 'marketing', 'google ads', 'content marketing', 'google analytics'] },
  { pattern: /\b(sales executive|sales representative|sales manager|business development executive|bde|bdr|sdr|account executive)/i, skills: ['sales', 'b2b sales', 'lead generation', 'crm', 'client relationship'] },
  { pattern: /\b(customer support|customer service|customer success|client support|helpdesk)/i, skills: ['customer support', 'client communication', 'problem solving', 'crm'] },
  { pattern: /\b(content writer|copywriter|technical writer|content creator)/i, skills: ['content writing', 'copywriting', 'seo', 'editing', 'research'] },
  { pattern: /\b(legal counsel|attorney|lawyer|paralegal|compliance manager)/i, skills: ['legal', 'contracts', 'compliance', 'regulatory compliance'] },
];

const TECHNICAL_SKILL_SET = new Set([
  'java', 'python', 'javascript', 'typescript', 'react', 'react native', 'angular', 'vue',
  'next.js', 'node.js', 'express', 'django', 'fastapi', 'spring boot', 'c++', 'c#', '.net',
  'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'flutter', 'dart', 'sql', 'mongodb',
  'redis', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'devops', 'git', 'linux',
  'graphql', 'rest api', 'microservices', 'machine learning', 'deep learning', 'data science',
  'spark', 'tableau', 'power bi', 'qa', 'testing', 'selenium', 'cypress', 'ui/ux', 'figma',
  'cybersecurity', 'solidity', 'blockchain',
]);

const extractSkills = (title = '', description = '', rawSkills = [], categoryHint = null) => {
  const scoredSkills = new Map(); // skill -> score
  const cleanTitle = normalize(title);
  const coreDesc = extractCoreRequirementsSection(description);
  const cleanDesc = normalize(coreDesc);

  // Infer category if not provided
  const category = categoryHint || (classifyJob(title, description).category);
  const isNonTechnical = category === 'non-technical';

  // Helper to add scored skill
  const addSkill = (skill, score) => {
    const canonical = SKILL_ALIASES[skill.toLowerCase().trim()] || skill.toLowerCase().trim();
    if (!canonical || canonical.length < 2) return;

    // Guard: Prevent assigning technical coding languages to non-technical roles unless in title
    if (isNonTechnical && TECHNICAL_SKILL_SET.has(canonical)) {
      const escaped = canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const inTitle = new RegExp(`\\b${escaped}\\b`, 'i').test(cleanTitle);
      if (!inTitle) return;
    }

    const current = scoredSkills.get(canonical) || 0;
    scoredSkills.set(canonical, current + score);
  };

  // 1. Check direct raw provider tags (High reliability)
  if (Array.isArray(rawSkills) && rawSkills.length > 0) {
    rawSkills.forEach((tag) => {
      if (typeof tag === 'string' && tag.trim()) {
        addSkill(tag, 60);
      }
    });
  }

  // 2. High-precision Title pattern match (Highest weight: 100)
  TITLE_SKILL_MAP.forEach(({ pattern, skills }) => {
    if (pattern.test(cleanTitle)) {
      skills.forEach((s) => addSkill(s, 100));
    }
  });

  // 3. Match individual words in Title against aliases
  if (cleanTitle) {
    cleanTitle.split(' ').forEach((w) => {
      const mapped = SKILL_ALIASES[w];
      if (mapped) addSkill(mapped, 80);
    });
  }

  // 4. Scan the Core Requirements / Tech Stack portion of Description
  Object.keys(SKILL_EXTRACT).forEach((skill) => {
    // If non-tech role, skip checking tech skills in description
    if (isNonTechnical && TECHNICAL_SKILL_SET.has(skill)) {
      return;
    }

    const aliases = SKILL_EXTRACT[skill];
    aliases.forEach((alias) => {
      const normAlias = normalize(alias);
      if (!normAlias) return;

      const escaped = normAlias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Check title first
      const titleRegex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (titleRegex.test(cleanTitle)) {
        addSkill(skill, 90);
        return;
      }

      // Strict boundary check for short aliases (<= 3 chars)
      if (normAlias.length <= 3) {
        const strictDescRegex = new RegExp(`(?:experience with|proficient in|knowledge of|using|stack|skills?|technologies?)[^.\\n]*?\\b${escaped}\\b`, 'i');
        if (strictDescRegex.test(cleanDesc)) {
          addSkill(skill, 40);
        }
        return;
      }

      // Standard boundary check in requirements section
      const descRegex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (descRegex.test(cleanDesc)) {
        addSkill(skill, 30);
      }
    });
  });

  // Sort skills by relevance score descending and pick top 4 to 6 clean skills
  const sorted = Array.from(scoredSkills.entries())
    .filter(([_, score]) => score >= 30)
    .sort((a, b) => b[1] - a[1])
    .map(([skill]) => skill);

  // If empty fallback based on title pattern
  if (sorted.length === 0) {
    if (isNonTechnical) {
      return ['communication', 'problem solving', 'teamwork'];
    }
    return ['software development', 'problem solving'];
  }

  return sorted.slice(0, 6);
};

module.exports = { extractSkills, normalize };
