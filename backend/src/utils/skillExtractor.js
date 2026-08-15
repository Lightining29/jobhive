const { SKILL_EXTRACT, SKILL_ALIASES } = require('./skills');

const normalize = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[^\w+#.\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const extractSkills = (title, description = '') => {
  const found = new Set();
  const cleanTitle = normalize(title);
  const cleanDesc = normalize(description.slice(0, 8000));
  const combined = `${cleanTitle} ${cleanDesc}`;

  // 1. Check title words first (high precision)
  if (cleanTitle) {
    const titleWords = cleanTitle.split(' ');
    titleWords.forEach((word) => {
      const mapped = SKILL_ALIASES[word];
      if (mapped) found.add(mapped);
    });
  }

  // 2. Check each skill's dedicated aliases
  Object.keys(SKILL_EXTRACT).forEach((skill) => {
    const aliases = SKILL_EXTRACT[skill];
    const matched = aliases.some((alias) => {
      const normAlias = normalize(alias);
      if (!normAlias) return false;

      // Escape special characters (+, #, ., etc.)
      const escaped = normAlias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Check title first
      const titleRegex = new RegExp(`(^|[^a-z0-9+#.])${escaped}($|[^a-z0-9+#.])`, 'i');
      if (titleRegex.test(cleanTitle)) return true;

      // For 1 or 2 letter keywords (like c, r, go, ts, js, ai, ml), require strict word boundary in title or description
      if (normAlias.length <= 2) {
        // Only match if in title or explicitly standalone in description
        return new RegExp(`\\b${escaped}\\b`, 'i').test(cleanTitle);
      }

      // Check description
      const descRegex = new RegExp(`(^|[^a-z0-9+#.])${escaped}($|[^a-z0-9+#.])`, 'i');
      return descRegex.test(cleanDesc);
    });

    if (matched) {
      found.add(skill);
    }
  });

  return Array.from(found);
};

module.exports = { extractSkills, normalize };
