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
      /(i\s+need|want|looking)\s+(a\s+)?(job|work|role|position)/i,
      /(job\s+)?(openings?|vacancies?|opportunities?)/i,
      /(hiring|recruiting|we\s+are\s+hiring)/i,
      /work\s+(from\s+home|remote|from\s+office)/i,
      /(backend|frontend|fullstack|full.stack|devops|data\s+scientist|data\s+engineer|software|web|mobile)\s+(developer|engineer|jobs?)/i,
      /(react|angular|vue|python|java|node|golang|typescript|javascript)\s+(jobs?|developer|roles?)/i,
      /jobs?\s+for\s+(freshers?|seniors?|juniors?|students?|interns?)/i,
      /(apply|applying)\s+for\s+(a\s+)?(job|role|position)/i,
    ],
    examples: [
      'find java jobs in delhi',
      'remote react jobs',
      'show me python jobs',
      'any devops jobs available',
      'internships in bangalore',
      'fresher jobs',
      'I need a job in Mumbai',
      'backend developer openings',
      'work from home vacancies',
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
    remote: /remote|work\s+from\s+home|wfh|telecommute|work\s+at\s+home/i,
    onsite: /onsite|on-site|office|in-office|in\s+person|at\s+office/i,
    hybrid: /hybrid|flexible|mixed\s+mode/i,
    fullTime: /full[\s-]?time|permanent/i,
    partTime: /part[\s-]?time/i,
    contract: /contract|freelance|gig|temporary/i,
    internship: /intern|internship|apprentice|training/i,
    fresher: /fresher|entry[\s-]?level|junior|0\s*year|no\s+experience/i,
    senior: /senior|sr\.?|lead|principal|architect/i,
  },
  sort: {
    salary: /salary|pay|highest\s+pay|highest\s+salary|well[\s-]?paid|top\s+pay|best\s+pay/i,
    newest: /newest|latest|recent|new|just\s+posted|fresh/i,
    trending: /trending|popular|hot|top|most\s+viewed/i,
  },
  techStack: [
    'javascript', 'typescript', 'python', 'java', 'react', 'angular', 'vue',
    'node', 'express', 'django', 'flask', 'spring', 'aws', 'azure', 'gcp',
    'docker', 'kubernetes', 'devops', 'machine learning', 'ai', 'data science',
    'flutter', 'swift', 'kotlin', 'golang', 'rust', 'php', 'laravel', 'ruby',
    'rails', 'sql', 'mongodb', 'postgresql', 'redis', 'graphql', 'rest',
    'html', 'css', 'tailwind', 'sass', 'nextjs', 'nuxt', 'svelte',
    'git', 'ci/cd', 'agile', 'scrum', 'microservices', 'api',
    'c++', 'c#', '.net', 'go', 'solidity', 'blockchain',
    'pandas', 'numpy', 'tensorflow', 'pytorch',
  ],
  jobTitles: [
    'software engineer', 'software developer', 'web developer', 'frontend developer',
    'backend developer', 'full stack developer', 'fullstack developer',
    'mobile developer', 'ios developer', 'android developer', 'flutter developer',
    'react developer', 'angular developer', 'vue developer',
    'python developer', 'java developer', 'node developer', 'nodejs developer',
    'golang developer', 'rust developer', 'php developer',
    'data scientist', 'data engineer', 'data analyst', 'ml engineer',
    'machine learning engineer', 'ai engineer', 'devops engineer', 'sre',
    'cloud engineer', 'cloud architect', 'solutions architect',
    'qa engineer', 'test engineer', 'software tester',
    'product manager', 'project manager', 'engineering manager',
    'ux designer', 'ui designer', 'product designer', 'graphic designer',
    'security engineer', 'cybersecurity', 'blockchain developer',
    'database administrator', 'dba', 'network engineer',
    'technical writer', 'content writer', 'seo specialist',
    'digital marketing', 'marketing manager', 'sales executive',
    'business analyst', 'operations analyst', 'hr manager',
    'recruiter', 'talent acquisition', 'finance analyst',
    'accountant', 'customer support', 'customer success',
  ],
  commonCompanies: [
    'google', 'microsoft', 'amazon', 'meta', 'facebook', 'apple',
    'tcs', 'infosys', 'wipro', 'accenture', 'ibm', 'cognizant',
    'capgemini', 'hcl', 'tech mahindra', 'paytm', 'flipkart',
    'swiggy', 'zomato', 'ola', 'uber', 'byjus', 'unacademy',
    'upgrad', 'cRED', 'phonepe', 'razorpay', 'swiggy',
  ],
  countries: [
    'india', 'usa', 'united states', 'uk', 'united kingdom', 'canada',
    'australia', 'singapore', 'dubai', 'uae', 'germany', 'france',
    'japan', 'china', 'brazil', 'netherlands', 'sweden', 'norway',
  ],
  cities: [
    'bangalore', 'mumbai', 'delhi', 'ncr', 'gurgaon', 'gurugram',
    'noida', 'pune', 'hyderabad', 'chennai', 'kolkata', 'ahmedabad',
    'surat', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore',
    'thiruvananthapuram', 'coimbatore', 'vadodara', 'rajkot',
    'bhopal', 'patna', 'chandigarh', 'kochi', 'goa',
    'new york', 'san francisco', 'los angeles', 'seattle',
    'london', 'toronto', 'sydney', 'berlin', 'paris', 'singapore',
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
  const lower = text.toLowerCase();

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

  const detectedTech = CONTEXT_KEYWORDS.techStack.filter((tech) => lower.includes(tech));
  if (detectedTech.length) {
    entities.skills = detectedTech;
  }

  const detectedJobTitles = CONTEXT_KEYWORDS.jobTitles.filter((t) => lower.includes(t));
  if (detectedJobTitles.length) {
    entities.jobTitles = detectedJobTitles;
    entities.search = detectedJobTitles[0];
  }

  const detectedCompany = CONTEXT_KEYWORDS.commonCompanies.find((c) => lower.includes(c));
  if (detectedCompany) {
    entities.company = detectedCompany;
  }

  const detectedCity = CONTEXT_KEYWORDS.cities.find((c) => lower.includes(` ${c} `) || lower.endsWith(` ${c}`) || lower.startsWith(`${c} `) || lower === c);
  const detectedCountry = CONTEXT_KEYWORDS.countries.find((c) => lower.includes(c));

  const locationMatch = text.match(/(?:in|at|near|around)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  if (detectedCity) {
    entities.location = detectedCity.charAt(0).toUpperCase() + detectedCity.slice(1);
    entities.city = entities.location;
  } else if (locationMatch) {
    entities.location = locationMatch[1];
    entities.city = locationMatch[1];
  }
  if (detectedCountry) {
    entities.country = detectedCountry.charAt(0).toUpperCase() + detectedCountry.slice(1);
  }

  const salaryMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?|lac|k|lakh|crore|cr)/i);
  if (salaryMatch) {
    const raw = parseFloat(salaryMatch[1]);
    const suffix = salaryMatch[0].toLowerCase();
    if (/crore|cr/.test(suffix)) {
      entities.salary = Math.round(raw * 100);
    } else if (/k/i.test(suffix)) {
      entities.salary = Math.round(raw / 100);
    } else {
      entities.salary = Math.round(raw);
    }
  }

  const salaryRangeMatch = text.match(/(\d+)\s*[-–to]+\s*(\d+)\s*(?:lpa|lakhs?|lac)/i);
  if (salaryRangeMatch) {
    entities.salary = parseInt(salaryRangeMatch[1], 10);
  }

  const expMatch = text.match(/(\d+)\s*(?:\s*\+?\s*years?\s*(?:of\s*)?experience|yrs?)/i);
  if (expMatch) {
    entities.yearsExp = parseInt(expMatch[1], 10);
  } else if (/(1|2|3|4|5|6|7|8|9|10)\+?\s*(?:yoe|years)/i.test(text)) {
    const m = text.match(/(1|2|3|4|5|6|7|8|9|10)\+?\s*(?:yoe|years)/i);
    entities.yearsExp = parseInt(m[1], 10);
  }

  if (/today|now|right\s+now|current|latest|just\s+posted/i.test(text)) {
    entities.freshness = 'today';
  } else if (/this\s+week|recent|past\s+week|last\s+7\s*days/i.test(text)) {
    entities.freshness = 'week';
  } else if (/this\s+month|last\s+30\s*days/i.test(text)) {
    entities.freshness = 'month';
  }

  if (/highest\s+salary|top\s+pay|best\s+pay|well[\s-]?paid|maximum\s+salary|max\s+pay/i.test(text)) {
    entities.sortBy = 'salary';
  }

  if (/(?:scope|search|find|global|worldwide|international)/i.test(text) && !detectedCity && !detectedCountry && !locationMatch) {
    entities.scope = 'global';
  }

  const categoryHints = /(tech|technical|technology|it\s+|software|engineering|developer|coding|programming)/i;
  if (categoryHints.test(text) || (detectedTech.length && detectedTech.length > 0)) {
    entities.category = 'technical';
  } else if (/(marketing|sales|hr|human\s+resources|finance|accounting|content|writing|design|non\s*tech|nontechnical|support|customer)/i.test(text)) {
    entities.category = 'non-technical';
  }

  return entities;
}

function buildSearchQuery(intent, entities, context = {}) {
  const query = {};

  const skillsFromEntities = entities.skills || [];
  const skillsFromTitles = entities.jobTitles ? entities.jobTitles.flatMap((t) => {
    const words = t.toLowerCase().split(/[\s-]+/);
    return CONTEXT_KEYWORDS.techStack.filter((tech) => words.includes(tech));
  }) : [];
  const allSkills = [...new Set([...skillsFromEntities, ...skillsFromTitles])];
  if (allSkills.length) {
    query.skills = allSkills.join(',');
  }

  if (entities.search) query.search = entities.search;
  if (entities.company) query.company = entities.company;

  if (entities.remote) query.workMode = 'remote';
  else if (entities.hybrid) query.workMode = 'hybrid';
  else if (entities.onsite) query.workMode = 'onsite';

  if (entities.fullTime) query.employmentType = 'full-time';
  else if (entities.partTime) query.employmentType = 'part-time';
  else if (entities.contract) query.employmentType = 'contract';
  else if (entities.internship) query.employmentType = 'internship';

  if (entities.fresher) query.experience = 'fresher';
  else if (entities.senior) query.experience = 'senior';
  else if (entities.yearsExp !== undefined) query.experience = String(entities.yearsExp);

  if (entities.city) query.city = entities.city;
  if (entities.country) query.country = entities.country;

  if (entities.salary) {
    query.salaryMin = String(entities.salary * 100000);
  }

  if (entities.category) query.category = entities.category;
  if (entities.scope) query.scope = entities.scope;

  if (entities.sortBy) query.sort = entities.sortBy;
  else query.sort = 'newest';

  if (entities.freshness === 'today') query.postedWithinDays = '1';
  else if (entities.freshness === 'week') query.postedWithinDays = '7';
  else if (entities.freshness === 'month') query.postedWithinDays = '30';

  query.limit = query.limit || '10';

  if (context.lastSearch) {
    if (!query.workMode && context.lastSearch.workMode) query.workMode = context.lastSearch.workMode;
    if (!query.employmentType && context.lastSearch.employmentType) query.employmentType = context.lastSearch.employmentType;
    if (!query.skills && context.lastSearch.skills) query.skills = context.lastSearch.skills;
    if (!query.city && context.lastSearch.city) query.city = context.lastSearch.city;
    if (!query.country && context.lastSearch.country) query.country = context.lastSearch.country;
    if (!query.category && context.lastSearch.category) query.category = context.lastSearch.category;
    if (!query.search && context.lastSearch.search) query.search = context.lastSearch.search;
    if (!query.scope && context.lastSearch.scope) query.scope = context.lastSearch.scope;
  }

  if (context.memoryContext?.preferredWorkMode && !query.workMode) {
    query.workMode = context.memoryContext.preferredWorkMode;
  }
  if (context.memoryContext?.preferredLocation && !query.city && !query.country) {
    query.city = context.memoryContext.preferredLocation;
  }
  if (context.memoryContext?.preferredSkills?.length && !query.skills) {
    query.skills = context.memoryContext.preferredSkills.join(',');
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
