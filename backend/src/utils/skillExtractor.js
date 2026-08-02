const { SKILL_EXTRACT, SKILL_ALIASES } = require('./skills');

const normalize = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, '')
    .trim();

const extractSkills = (title, description = '') => {
  const found = new Map();
  const combined = normalize(`${title} ${description}`);

  Object.keys(SKILL_EXTRACT).forEach((skill) => {
    const aliases = SKILL_EXTRACT[skill];
    const hit = aliases.some((alias) => {
      const normalized = normalize(alias);
      if (normalized.length < 3) return false;
      if (normalized.endsWith('.')) return combined.includes(normalized);
      return new RegExp(`(^|[^a-z0-9+#.])${normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^a-z0-9+#.])`).test(combined);
    });
    if (hit) found.set(skill, true);
  });

  if (title) {
    const titleWords = normalize(title).split(' ');
    titleWords.forEach((word) => {
      if (word.length < 3) return;
      if (SKILL_ALIASES[word]) found.set(SKILL_ALIASES[word], true);
    });
  }

  return Array.from(found.keys());
};

module.exports = { extractSkills, normalize };
