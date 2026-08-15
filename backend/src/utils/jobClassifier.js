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

const classifyCategory = (title, description = '') => {
  const cleanTitle = clean(title);
  const cleanDesc = clean(description.slice(0, 4000));

  let technicalScore = 0;
  let nonTechnicalScore = 0;

  // Title matching has 5x weight
  TECHNICAL_KEYWORDS.forEach((kw) => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(cleanTitle)) technicalScore += 5;
    else if (regex.test(cleanDesc)) technicalScore += 1;
  });

  NON_TECHNICAL_KEYWORDS.forEach((kw) => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(cleanTitle)) nonTechnicalScore += 5;
    else if (regex.test(cleanDesc)) nonTechnicalScore += 1;
  });

  // Explicit title rules
  if (/(developer|engineer|programmer|devops|architect|data scientist|software|fullstack|frontend|backend|cloud|qa|sdet|tech lead)/i.test(cleanTitle)) {
    return 'technical';
  }

  if (/(recruiter|human resource|sales executive|account executive|content writer|copywriter|digital marketer|accountant|lawyer|teacher|customer support|customer success|receptionist|nurse|chef|store manager)/i.test(cleanTitle)) {
    return 'non-technical';
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
