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

// Specific Technical Indicators in Title
const TECH_TITLE_REGEX = /\b(developer|software|engineer|programmer|coder|frontend|front-end|backend|back-end|fullstack|full-stack|full stack|web developer|devops|sre|cloud|solutions architect|database|dba|data scientist|data engineer|data analyst|machine learning|deep learning|artificial intelligence|ai engineer|ml engineer|cybersecurity|security engineer|infosec|soc analyst|pentester|penetration|qa\b|qa engineer|test engineer|software tester|sdet|automation engineer|mobile developer|ios\b|android\b|flutter|react native|systems engineer|firmware|embedded|iot\b|robotics|network engineer|blockchain|smart contract|solidity|tech lead|technical lead|technical product manager|cto|architect|scrum master|java\b|python\b|react\b|node\b|nodejs|angular\b|vue\b|golang\b|rust\b|c\+\+|c#|\.net|php\b|ruby\b|swift\b|kotlin\b|aws\b|azure\b|gcp\b|docker\b|kubernetes\b|linux\b|sql\b|bi developer|etl developer|salesforce developer|sap developer|ui\/ux|ux designer|ui designer|product designer)\b/i;

// Specific Non-Technical Indicators in Title
const NON_TECH_TITLE_REGEX = /\b(marketing|marketer|growth marketer|digital marketing|brand manager|campaign manager|seo\b|sem\b|social media|affiliate marketing|advertising|translator|translation|interpreter|localization|linguist|language specialist|transcriptionist|business executive|business development|account executive|sales executive|sales representative|sales rep|sales manager|client executive|operations|operations executive|operations lead|operations manager|executive assistant|relationship manager|bdr|sdr|bde|recruiter|recruitment|talent acquisition|human resource|hr executive|hr manager|hr generalist|people operations|people ops|sourcer|copywriter|content writer|content creator|journalist|editor|accountant|accounting|financial analyst|auditor|tax specialist|bookkeeper|legal counsel|paralegal|lawyer|compliance|customer support|customer service|customer success|client support|client success|call center|telecaller|office assistant|receptionist|store manager|retail associate|nursing|nurse|physician|chef|cook|driver|producer|program manager|programs manager|event manager|creative director|art director|community manager|procurement|supply chain|logistics)\b/i;

const classifyCategory = (title, description = '') => {
  const cleanTitle = clean(title);

  // 1. Explicit Non-Technical Override: If title is non-tech (and not tech software title), strictly non-technical
  if (NON_TECH_TITLE_REGEX.test(cleanTitle) && !TECH_TITLE_REGEX.test(cleanTitle)) {
    return 'non-technical';
  }

  // 2. Explicit Technical Match
  if (TECH_TITLE_REGEX.test(cleanTitle)) {
    return 'technical';
  }

  // 3. Score-based fallback using title keywords
  let technicalScore = 0;
  let nonTechnicalScore = 0;

  TECHNICAL_KEYWORDS.forEach((kw) => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(cleanTitle)) technicalScore += 10;
  });

  NON_TECHNICAL_KEYWORDS.forEach((kw) => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(cleanTitle)) nonTechnicalScore += 10;
  });

  if (technicalScore > nonTechnicalScore && technicalScore > 0) {
    return 'technical';
  }

  // Default to non-technical when ambiguous / general business title
  return 'non-technical';
};

const classifySubCategory = (category, title, description = '') => {
  const cleanTitle = clean(title);
  const cleanDesc = clean(description.slice(0, 3000));
  const map = category === 'technical' ? TECHNICAL_CATEGORIES : NON_TECHNICAL_CATEGORIES;

  let best = category === 'technical' ? 'Software Development' : 'Operations & Supply Chain';
  let bestScore = -1;

  Object.keys(map).forEach((sub) => {
    const keywords = map[sub];
    let score = 0;
    keywords.forEach((kw) => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(cleanTitle)) score += 5;
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

module.exports = { classifyJob, classifyCategory, classifySubCategory, TECH_TITLE_REGEX, NON_TECH_TITLE_REGEX };
