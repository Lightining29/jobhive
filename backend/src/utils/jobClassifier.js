const {
  TECHNICAL_KEYWORDS,
  NON_TECHNICAL_KEYWORDS,
  TECHNICAL_CATEGORIES,
  NON_TECHNICAL_CATEGORIES,
} = require('./skills');

const clean = (text) => String(text || '').toLowerCase().trim();

const classifyCategory = (title, description = '') => {
  const haystack = `${clean(title)} ${clean(description)}`;
  let technicalHits = 0;
  let nonTechnicalHits = 0;

  TECHNICAL_KEYWORDS.forEach((kw) => {
    if (haystack.includes(kw)) technicalHits += 1;
  });
  NON_TECHNICAL_KEYWORDS.forEach((kw) => {
    if (haystack.includes(kw)) nonTechnicalHits += 1;
  });

  return technicalHits >= nonTechnicalHits ? 'technical' : 'non-technical';
};

const classifySubCategory = (category, title, description = '') => {
  const haystack = `${clean(title)} ${clean(description)}`;
  const map = category === 'technical' ? TECHNICAL_CATEGORIES : NON_TECHNICAL_CATEGORIES;

  let best = category === 'technical' ? 'Other Technical' : 'Other Non-Technical';
  let bestScore = 0;

  Object.keys(map).forEach((sub) => {
    const keywords = map[sub];
    const score = keywords.reduce((acc, kw) => acc + (haystack.includes(kw) ? 1 : 0), 0);
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

module.exports = { classifyJob, classifyCategory };
