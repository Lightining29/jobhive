const INTENT_PATTERNS = {
  job_search: {
    patterns: [
      /find\s+(me\s+)?(.*?\s+)?jobs?/i,
      /search\s+(for\s+)?(.*?\s+)?jobs?/i,
      /show\s+(me\s+)?(.*?\s+)?jobs?/i,
      /looking\s+for\s+(.*?\s+)?jobs?/i,
      /any\s+(.*?\s+)?jobs?\s+(available|open)/i,
      /get\s+(me\s+)?(.*?\s+)?jobs?/i,
      /(\w+)\s+jobs?/i,
      /jobs?\s+(in|at|near|around)\s+(.+)/i,
      /remote\s+(.*)?/i,
      /internship/i,
      /fresher\s+(.*)?/i,
    ],
    examples: [
      'find java jobs in delhi',
      'remote react jobs',
      'show me python jobs',
      'any devops jobs available',
      'internships in bangalore',
      'fresher jobs',
    ],
  },
  job_detail: {
    patterns: [
      /explain\s+(this|the)\s+(job|position|role)/i,
      /tell\s+me\s+about\s+(this|the)\s+(job|position|role)/i,
      /what\s+(does|is)\s+(this|the)\s+(job|role)\s+(involve|about)/i,
      /describe\s+(this|the)\s+(job|position)/i,
      /more\s+(about|details?)\s+(this|the)/i,
    ],
    examples: [
      'explain this job',
      'tell me about this position',
      'what does this role involve',
    ],
  },
  company_info: {
    patterns: [
      /explain\s+(this|the)\s+company/i,
      /tell\s+me\s+about\s+(this|the)\s+company/i,
      /what\s+(is|does)\s+(this|the)\s+company/i,
      /company\s+(info|information|details)/i,
      /about\s+(this|the)\s+company/i,
      /who\s+(is|are)\s+(this|the)\s+company/i,
    ],
    examples: [
      'explain this company',
      'tell me about the company',
      'company information',
    ],
  },
  career_coach: {
    patterns: [
      /career\s+(advice|coach|guidance|help|tips)/i,
      /help\s+me\s+with\s+my\s+career/i,
      /what\s+should\s+i\s+(do|learn|study)/i,
      /career\s+path/i,
      /career\s+guidance/i,
      /suggest.*career/i,
    ],
    examples: [
      'career advice',
      'help me with my career',
      'what should i learn next',
      'career path suggestions',
    ],
  },
  interview_prep: {
    patterns: [
      /interview\s+(prep|prepare|preparation|questions|tips)/i,
      /help\s+me\s+(prepare|get\s+ready)\s+(for|to)\s+(an?\s+)?interview/i,
      /common\s+interview\s+questions?/i,
      /practice\s+interview/i,
      /how\s+to\s+(ace|pass|crack)\s+(an?\s+)?interview/i,
    ],
    examples: [
      'interview preparation',
      'help me prepare for an interview',
      'common interview questions',
      'how to ace an interview',
    ],
  },
  resume_help: {
    patterns: [
      /resume\s+(review|improve|improvement|help|tips|advice)/i,
      /help\s+(me\s+)?(with|improve|write)\s+(my\s+)?resume/i,
      /cv\s+(review|improve|help|tips)/i,
      /resume\s+score/i,
      /review\s+(my\s+)?resume/i,
      /how\s+to\s+(write|improve)\s+(a\s+)?resume/i,
    ],
    examples: ['help me with my resume', 'improve my resume', 'review my resume'],
  },
  resume_build: {
    patterns: [
      /build\s+(my\s+)?resume/i,
      /create\s+(my\s+|a\s+)?resume/i,
      /generate\s+(my\s+|a\s+)?resume/i,
      /make\s+(my\s+|a\s+)?resume/i,
      /write\s+(my\s+)?resume/i,
      /ai\s+resume/i,
      /resume\s+(builder|generator|maker)/i,
    ],
    examples: ['build my resume', 'create my resume', 'generate resume', 'AI resume builder'],
  },
  ats_score: {
    patterns: [
      /ats\s+(score|check|test|analyse|analyze|optimize|optimise)/i,
      /check\s+(my\s+)?resume\s+(against|for|with)/i,
      /resume\s+(match|fit|ats)/i,
      /how\s+(well\s+does\s+my|does\s+my)\s+resume\s+match/i,
      /applicant\s+tracking/i,
      /optimize\s+(my\s+)?resume\s+for/i,
      /resume\s+(score|rating)\s+for/i,
    ],
    examples: ['ATS score check', 'check my resume against this job', 'optimize resume for job'],
  },
  skill_gap: {
    patterns: [
      /skill\s+gap/i,
      /what\s+skills?\s+(should\s+i|do\s+i\s+need|am\s+i\s+missing)/i,
      /skills?\s+(to\s+learn|needed|required|missing)/i,
      /which\s+skills?\s+(should|would|can)/i,
      /am\s+i\s+(missing|lacking)\s+(any\s+)?skills?/i,
    ],
    examples: [
      'skill gap analysis',
      'what skills should i learn',
      'which skills am i missing',
    ],
  },
  learning_roadmap: {
    patterns: [
      /learning\s+roadmap/i,
      /roadmap\s+(for|to)\s+(learn|become|get)/i,
      /how\s+to\s+(learn|become|start)\s+(a\s+)?(.*?)(\s+developer|\s+engineer)/i,
      /what\s+(should\s+i|to)\s+learn\s+(next|first|to\s+become)/i,
      /study\s+plan/i,
    ],
    examples: [
      'learning roadmap for react developer',
      'how to become a full stack developer',
      'what should i learn next',
    ],
  },
  salary_insight: {
    patterns: [
      /salary\s+(insight|info|information|range|estimate|expectation)/i,
      /how\s+much\s+(do|can|should)\s+(i|a|the)/i,
      /average\s+salary/i,
      /salary\s+(for|of|in)\s+(.*?)(\s+in\s+(.*))?$/i,
      /pay\s+(range|scale|scale)/i,
      /what\s+(do|can)\s+(i|a)\s+\w+\s+(make|earn|expect)/i,
    ],
    examples: [
      'salary for react developer in bangalore',
      'average salary for java developer',
      'how much do software engineers make',
    ],
  },
  recommendation: {
    patterns: [
      /recommend\s+(me\s+)?(.*?\s+)?(jobs?|positions?|roles?)/i,
      /suggested?\s+(.*?\s+)?(jobs?|positions?)/i,
      /personalized\s+(.*?\s+)?(jobs?|recommendations?)/i,
      /what\s+jobs?\s+(match|suit|fit)\s+my/i,
      /best\s+(.*?\s+)?(jobs?|matches?)\s+for\s+me/i,
    ],
    examples: [
      'recommend me some jobs',
      'what jobs match my skills',
      'best jobs for me',
    ],
  },
  saved_jobs: {
    patterns: [
      /my\s+saved\s+jobs?/i,
      /show\s+(me\s+)?(my\s+)?saved\s+jobs?/i,
      /jobs?\s+i\s+(saved|bookmarked)/i,
      /view\s+saved/i,
    ],
    examples: [
      'show me my saved jobs',
      'my saved jobs',
    ],
  },
  applications: {
    patterns: [
      /my\s+applications?/i,
      /jobs?\s+i\s+(applied|applied\s+to)/i,
      /application\s+(status|history)/i,
      /show\s+(me\s+)?(my\s+)?applications?/i,
      /where\s+did\s+i\s+apply/i,
    ],
    examples: [
      'show my applications',
      'jobs i applied to',
      'my application status',
    ],
  },
  greeting: {
    patterns: [
      /^(hi|hello|hey|howdy|good\s+(morning|afternoon|evening)|greetings)/i,
      /^(what'?s\s+up|sup|yo)/i,
    ],
    examples: ['hello', 'hi there', 'good morning'],
  },
  help: {
    patterns: [
      /what\s+(can|do)\s+you\s+do/i,
      /help\s+me/i,
      /how\s+do\s+i\s+use\s+you/i,
      /features?/i,
      /capabilities/i,
      /what\s+are\s+your\s+(abilities|features)/i,
    ],
    examples: [
      'what can you do',
      'help me',
      'what are your features',
    ],
  },
};

const CONTEXT_KEYWORDS = {
  filters: {
    remote: /remote|work\s+from\s+home|wfh|telecommute/i,
    onsite: /onsite|on-site|office|in-office/i,
    hybrid: /hybrid|flexible/i,
    fullTime: /full[\s-]?time/i,
    partTime: /part[\s-]?time/i,
    contract: /contract|freelance|gig/i,
    internship: /intern|internship/i,
    fresher: /fresher|entry[\s-]?level|junior/i,
    senior: /senior|sr\.?|lead|principal/i,
  },
  sort: {
    salary: /salary|pay|highest\s+pay|highest\s+salary|well[\s-]?paid/i,
    newest: /newest|latest|recent|new/i,
    trending: /trending|popular|hot/i,
  },
  techStack: [
    'javascript', 'typescript', 'python', 'java', 'react', 'angular', 'vue',
    'node', 'express', 'django', 'flask', 'spring', 'aws', 'azure', 'gcp',
    'docker', 'kubernetes', 'devops', 'machine learning', 'ai', 'data science',
    'flutter', 'swift', 'kotlin', 'golang', 'rust', 'php', 'laravel', 'ruby',
    'rails', 'sql', 'mongodb', 'postgresql', 'redis', 'graphql', 'rest',
    'html', 'css', 'tailwind', 'sass', 'nextjs', 'nuxt', 'svelte',
    'git', 'ci/cd', 'agile', 'scrum', 'microservices', 'api',
  ],
};

function detectIntent(text) {
  const normalized = text.trim().toLowerCase();

  for (const [intent, config] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of config.patterns) {
      if (pattern.test(normalized)) {
        const extracted = extractEntities(normalized);
        return { intent, confidence: 0.85, entities: extracted };
      }
    }
  }

  const fallbackIntent = detectFallbackIntent(normalized);
  return fallbackIntent;
}

function detectFallbackIntent(text) {
  const words = text.split(/\s+/);
  const hasJobWord = words.some((w) => ['job', 'jobs', 'position', 'role', 'opening'].includes(w));
  const hasTechWord = CONTEXT_KEYWORDS.techStack.some((t) => text.includes(t));
  const hasLocation = /in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/.test(text);

  if (hasTechWord && (hasJobWord || hasLocation || words.length <= 5)) {
    const extracted = extractEntities(text);
    return { intent: 'job_search', confidence: 0.6, entities: extracted };
  }

  if (hasJobWord) {
    const extracted = extractEntities(text);
    return { intent: 'job_search', confidence: 0.5, entities: extracted };
  }

  const extracted = extractEntities(text);
  if (Object.keys(extracted).length > 0) {
    return { intent: 'job_search', confidence: 0.4, entities: extracted };
  }

  return { intent: 'general', confidence: 0.3, entities: {} };
}

function extractEntities(text) {
  const entities = {};

  for (const [filter, pattern] of Object.entries(CONTEXT_KEYWORDS.filters)) {
    if (pattern.test(text)) {
      entities[filter] = true;
    }
  }

  for (const [sort, pattern] of Object.entries(CONTEXT_KEYWORDS.sort)) {
    if (pattern.test(text)) {
      entities.sortBy = sort;
    }
  }

  const detectedTech = CONTEXT_KEYWORDS.techStack.filter((tech) => text.includes(tech));
  if (detectedTech.length) {
    entities.skills = detectedTech;
  }

  const locationMatch = text.match(/(?:in|at|near|around)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  if (locationMatch) {
    entities.location = locationMatch[1];
  }

  const salaryMatch = text.match(/(\d+)\s*(?:lpa|lakhs?|lac|k|lakh|crore|cr)/i);
  if (salaryMatch) {
    entities.salary = salaryMatch[1];
  }

  if (/today|now|right\s+now|current/i.test(text)) {
    entities.freshness = 'today';
  } else if (/this\s+week|recent/i.test(text)) {
    entities.freshness = 'week';
  }

  if (/highest\s+salary|top\s+pay|best\s+pay|well[\s-]?paid/i.test(text)) {
    entities.sortBy = 'salary';
  }

  return entities;
}

function buildSearchQuery(intent, entities, context = {}) {
  const query = {};

  if (entities.skills && entities.skills.length) {
    query.skills = entities.skills.join(',');
  }

  if (entities.remote) query.workMode = 'remote';
  else if (entities.hybrid) query.workMode = 'hybrid';
  else if (entities.onsite) query.workMode = 'onsite';

  if (entities.fullTime) query.employmentType = 'full-time';
  else if (entities.partTime) query.employmentType = 'part-time';
  else if (entities.contract) query.employmentType = 'contract';
  else if (entities.internship) query.employmentType = 'internship';

  if (entities.fresher) query.experience = 'fresher';
  else if (entities.senior) query.experience = 'senior';

  if (entities.location) query.city = entities.location;

  if (entities.salary) query.salaryMin = entities.salary;

  if (entities.sortBy) query.sort = entities.sortBy;
  else query.sort = 'newest';

  if (entities.freshness === 'today') query.postedWithinDays = '1';
  else if (entities.freshness === 'week') query.postedWithinDays = '7';

  if (context.lastSearch) {
    if (!query.workMode && context.lastSearch.workMode) query.workMode = context.lastSearch.workMode;
    if (!query.employmentType && context.lastSearch.employmentType) query.employmentType = context.lastSearch.employmentType;
    if (!query.skills && context.lastSearch.skills) query.skills = context.lastSearch.skills;
    if (!query.city && context.lastSearch.city) query.city = context.lastSearch.city;
  }

  return query;
}

module.exports = {
  detectIntent,
  extractEntities,
  buildSearchQuery,
  INTENT_PATTERNS,
  CONTEXT_KEYWORDS,
};
