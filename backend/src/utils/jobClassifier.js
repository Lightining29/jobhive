const {
  TECHNICAL_KEYWORDS,
  NON_TECHNICAL_KEYWORDS,
  TECHNICAL_CATEGORIES,
  NON_TECHNICAL_CATEGORIES,
} = require('./skills');

const clean = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const NON_TECH_TITLE_REGEX = /\b(marketing|marketer|growth marketer|digital marketing|brand manager|campaign manager|seo|sem|social media|affiliate marketing|advertising|translator|translation|interpreter|localization|linguist|language specialist|transcriptionist|business executive|business development|account executive|sales executive|sales representative|sales rep|sales manager|client executive|operations executive|executive assistant|relationship manager|bdr|sdr|bde|recruiter|recruitment|talent acquisition|human resource|hr executive|hr manager|people operations|sourcer|copywriter|content writer|content creator|journalist|editor|accountant|accounting|financial analyst|auditor|tax specialist|bookkeeper|legal counsel|paralegal|lawyer|customer support|customer service|customer success|call center|telecaller|office assistant|receptionist|store manager|retail associate|nursing|nurse|physician|chef|cook|driver)\b/i;

const TECH_TITLE_REGEX = /\b(developer|software engineer|software developer|programmer|coder|frontend|backend|fullstack|full-stack|full stack|web developer|devops|sre|cloud engineer|cloud architect|solutions architect|database administrator|dba|data scientist|data engineer|machine learning|deep learning|artificial intelligence|ai engineer|ml engineer|cybersecurity|security engineer|infosec|soc analyst|pentester|qa engineer|test engineer|software tester|sdet|mobile developer|ios developer|android developer|flutter developer|react native|systems engineer|firmware|embedded systems|iot engineer|robotics engineer|network engineer|blockchain developer|smart contract|solidity|tech lead|engineering manager|cto|scrum master|technical product manager)\b/i;

const classifyCategory = (title, description = '') => {
  const cleanTitle = clean(title);
  const cleanDesc = clean(description.slice(0, 4000));

  // 1. Strict Explicit Title Rules (Title takes priority over description mentions)
  if (NON_TECH_TITLE_REGEX.test(cleanTitle) && !TECH_TITLE_REGEX.test(cleanTitle)) {
    return 'non-technical';
  }

  if (TECH_TITLE_REGEX.test(cleanTitle) && !NON_TECH_TITLE_REGEX.test(cleanTitle)) {
    return 'technical';
  }

  let technicalScore = 0;
  let nonTechnicalScore = 0;

  // Title matching has 10x weight
  TECHNICAL_KEYWORDS.forEach((kw) => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(cleanTitle)) technicalScore += 10;
    else if (regex.test(cleanDesc)) technicalScore += 1;
  });

  NON_TECHNICAL_KEYWORDS.forEach((kw) => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(cleanTitle)) nonTechnicalScore += 10;
    else if (regex.test(cleanDesc)) nonTechnicalScore += 1;
  });

  if (NON_TECH_TITLE_REGEX.test(cleanTitle)) {
    return 'non-technical';
  }

  if (TECH_TITLE_REGEX.test(cleanTitle)) {
    return 'technical';
  }

  return technicalScore >= nonTechnicalScore ? 'technical' : 'non-technical';
};

const classifySubCategory = (category, title, description = '') => {
  const cleanTitle = clean(title);
  const cleanDesc = clean(description.slice(0, 3000));
  const map = category === 'technical' ? TECHNICAL_CATEGORIES : NON_TECHNICAL_CATEGORIES;

  let best = category === 'technical' ? 'Software Development' : 'Sales & BD';
  let bestScore = -1;

  Object.keys(map).forEach((sub) => {
    const keywords = map[sub];
    let score = 0;
    keywords.forEach((kw) => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(cleanTitle)) score += 4;
      else if (regex.test(cleanDesc)) score += 1;
    });

    if (score > bestScore) {
      bestScore = score;
      best = sub;
    }
  });

  return best;
};

const classifyJob = (title, description = '') => {
  const category = classifyCategory(title, description);
  const subCategory = classifySubCategory(category, title, description);
  return { category, subCategory };
};

module.exports = { classifyJob, classifyCategory, classifySubCategory };
