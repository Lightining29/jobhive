const SECTION_PATTERNS = [
  { key: 'position', label: 'Position', icon: 'Briefcase', patterns: [/^(?:position|role|designation|job\s*title)\s*:?\s*/im] },
  { key: 'department', label: 'Department', icon: 'Building', patterns: [/^(?:department|team|division)\s*:?\s*/im] },
  { key: 'location', label: 'Location', icon: 'LocationDot', patterns: [/^(?:location|work\s*location|workplace)\s*:?\s*/im] },
  { key: 'compensation', label: 'Compensation', icon: 'SackDollar', patterns: [/^(?:compensation|salary|pay|stipend|ctc|package)\s*:?\s*/im] },
  { key: 'about', label: 'About the Role', icon: 'Info', patterns: [
    /^(?:about\s+(?:the\s+)?(?:role|position|job|opportunity|us|company|the\s+company))\s*:?\s*/im,
    /^(?:who\s+we\s+are|company\s+overview|about\s+us)\s*:?\s*/im,
  ]},
  { key: 'mission', label: 'Mission', icon: 'Crosshairs', patterns: [/^(?:mission\s+of\s+the\s+role|mission)\s*:?\s*/im] },
  { key: 'responsibilities', label: 'Key Responsibilities', icon: 'ListCheck', patterns: [
    /^(?:key\s+responsibilities|responsibilities|what\s+you['']?ll\s+do|your\s+responsibilities|day[\s-]to[\s-]day\s+(?:key\s+)?responsibilities|role\s+and\s+responsibilities|what\s+you\s+will\s+do)\s*:?\s*/im,
  ]},
  { key: 'requirements', label: 'Requirements', icon: 'Star', patterns: [
    /^(?:requirements?|qualifications?|what\s+we['']?re\s+looking\s+for|we\s+are\s+looking\s+for|skills?\s+and\s+qualifications?|mandatory\s+requirements?|must[\s-]have)\s*:?\s*/im,
  ]},
  { key: 'skills', label: 'Skills Required', icon: 'Wrench', patterns: [
    /^(?:skills?\s+required|required\s+skills?|key\s+skills?|technologies?|tools?|tech\s+stack|proficiency)\s*:?\s*/im,
  ]},
  { key: 'experience', label: 'Experience', icon: 'ChartLine', patterns: [
    /^(?:experience|experience\s+required|years?\s+of\s+experience)\s*:?\s*/im,
  ]},
  { key: 'education', label: 'Education', icon: 'GraduationCap', patterns: [
    /^(?:education|educational?\s+qualifications?|degree)\s*:?\s*/im,
  ]},
  { key: 'perks', label: 'Perks & Benefits', icon: 'Gift', patterns: [
    /^(?:perks|benefits|what\s+we\s+offer|what\s+you['']?ll\s+get|our\s+benefits?|compensation\s+and\s+benefits?)\s*:?\s*/im,
  ]},
  { key: 'other', label: 'Other Information', icon: 'Ellipsis', patterns: [
    /^(?:other\s+(?:information|details?|requirements?)|additional\s+(?:information|notes?|requirements?))\s*:?\s*/im,
  ]},
];

const cleanHtml = (text) =>
  (text || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(p|div|li|h[1-6]|tr)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/•|·|▪|–|—/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

const splitIntoItems = (text) => {
  const lines = text
    .split(/\n/)
    .map((l) => l.replace(/^\s*[-•·▪]\s*/, '').replace(/^\d+[\.)]\s*/, '').trim())
    .filter((l) => l.length > 3 && l.length < 300);
  return lines;
};

const parseDescription = (raw) => {
  const text = cleanHtml(raw);
  if (!text) return [];

  const sections = [];
  const usedKeys = new Set();

  // Find all section boundaries
  const boundaries = [];
  for (const sec of SECTION_PATTERNS) {
    for (const pat of sec.patterns) {
      const match = text.match(pat);
      if (match) {
        boundaries.push({ index: match.index, key: sec.key, label: sec.label, icon: sec.icon, matchLen: match[0].length });
      }
    }
  }

  // Sort by position in text
  boundaries.sort((a, b) => a.index - b.index);

  // Deduplicate: keep only first occurrence of each key
  const seen = new Set();
  const uniqueBoundaries = boundaries.filter((b) => {
    if (seen.has(b.key)) return false;
    seen.add(b.key);
    return true;
  });

  // Extract content between boundaries
  for (let i = 0; i < uniqueBoundaries.length; i++) {
    const start = uniqueBoundaries[i].index + uniqueBoundaries[i].matchLen;
    const end = i + 1 < uniqueBoundaries.length ? uniqueBoundaries[i + 1].index : text.length;
    let content = text.substring(start, end).trim();

    // Remove trailing section headers that got captured
    for (const sec of SECTION_PATTERNS) {
      for (const pat of sec.patterns) {
        content = content.replace(pat, '').trim();
      }
    }

    if (!content) continue;

    const items = splitIntoItems(content);
    if (items.length === 0 && content.length < 10) continue;

    sections.push({
      key: uniqueBoundaries[i].key,
      label: uniqueBoundaries[i].label,
      icon: uniqueBoundaries[i].icon,
      items: items.length > 0 ? items : [content.substring(0, 200)],
    });
    usedKeys.add(uniqueBoundaries[i].key);
  }

  // If no sections found, treat entire text as summary
  if (sections.length === 0) {
    const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 10);
    sections.push({
      key: 'about',
      label: 'About the Role',
      icon: 'Info',
      items: sentences.slice(0, 5),
    });
  }

  // If there's content before the first section, add it as summary
  if (uniqueBoundaries.length > 0 && uniqueBoundaries[0].index > 20) {
    const preamble = text.substring(0, uniqueBoundaries[0].index).trim();
    if (preamble.length > 20) {
      const preambleItems = splitIntoItems(preamble);
      sections.unshift({
        key: 'summary',
        label: 'Overview',
        icon: 'Info',
        items: preambleItems.length > 0 ? preambleItems.slice(0, 3) : [preamble.substring(0, 200)],
      });
    }
  }

  return sections;
};

module.exports = { parseDescription };
