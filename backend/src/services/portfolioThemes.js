/**
 * portfolioThemes.js
 *
 * Each theme overrides the CSS custom-property variables in :root.
 * The base layout, components, and animations stay identical —
 * only colours, fonts, and accents change.
 *
 * Available themes
 *   dark-orange   – original  (dark bg, orange accent)
 *   dark-purple   – midnight  (dark bg, violet accent)
 *   dark-blue     – ocean     (dark bg, cyan/blue accent)
 *   dark-green    – matrix    (dark bg, emerald accent)
 *   light-minimal – clean     (white bg, slate accent)
 */

const THEMES = {
  'dark-orange': {
    label:    'Dark Orange',
    emoji:    '🟠',
    preview:  ['#08080a', '#ff6a00', '#ffffff'],
    cssVars:  '', // base — no overrides needed, style.css already uses these values
  },

  'dark-purple': {
    label:    'Dark Purple',
    emoji:    '🟣',
    preview:  ['#0a0812', '#8b5cf6', '#ffffff'],
    cssVars: `
  --bg-primary:   #0a0812;
  --bg-secondary: #110e1a;
  --bg-tertiary:  #1a1528;
  --accent-color: #8b5cf6;
  --accent-hover: #a78bfa;
  --accent-gradient: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  --accent-glow:  rgba(139, 92, 246, 0.15);
  --text-primary: #f5f3ff;
  --text-secondary: #a09dc0;
  --text-muted:   #6d6a85;`,
  },

  'dark-blue': {
    label:    'Dark Blue',
    emoji:    '🔵',
    preview:  ['#050d1a', '#38bdf8', '#ffffff'],
    cssVars: `
  --bg-primary:   #050d1a;
  --bg-secondary: #0c1829;
  --bg-tertiary:  #132035;
  --accent-color: #38bdf8;
  --accent-hover: #7dd3fc;
  --accent-gradient: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
  --accent-glow:  rgba(56, 189, 248, 0.15);
  --text-primary: #f0f9ff;
  --text-secondary: #94a3b8;
  --text-muted:   #64748b;`,
  },

  'dark-green': {
    label:    'Dark Green',
    emoji:    '🟢',
    preview:  ['#030b06', '#10b981', '#ffffff'],
    cssVars: `
  --bg-primary:   #030b06;
  --bg-secondary: #071410;
  --bg-tertiary:  #0d201a;
  --accent-color: #10b981;
  --accent-hover: #34d399;
  --accent-gradient: linear-gradient(135deg, #10b981 0%, #047857 100%);
  --accent-glow:  rgba(16, 185, 129, 0.15);
  --text-primary: #ecfdf5;
  --text-secondary: #9cb8af;
  --text-muted:   #6b7280;`,
  },

  'light-minimal': {
    label:    'Light Minimal',
    emoji:    '⚪',
    preview:  ['#f8fafc', '#6366f1', '#0f172a'],
    cssVars: `
  --bg-primary:   #f8fafc;
  --bg-secondary: #f1f5f9;
  --bg-tertiary:  #e2e8f0;
  --accent-color: #6366f1;
  --accent-hover: #4f46e5;
  --accent-gradient: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  --accent-glow:  rgba(99, 102, 241, 0.12);
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted:   #94a3b8;`,
  },
};

/**
 * Returns the theme object for the given key.
 * Falls back to dark-orange if unknown.
 */
function getTheme(key) {
  return THEMES[key] || THEMES['dark-orange'];
}

/**
 * Returns the list of themes for the frontend picker.
 */
function listThemes() {
  return Object.entries(THEMES).map(([id, t]) => ({
    id,
    label:   t.label,
    emoji:   t.emoji,
    preview: t.preview,
  }));
}

/**
 * Injects theme CSS-variable overrides into the base CSS string.
 *
 * Rules:
 *  1. @import must stay as the very first line (browser requirement).
 *  2. The theme :root block must come AFTER the base :root block so
 *     it wins the cascade (same specificity, later declaration wins).
 */
function applyTheme(baseCSS, themeKey) {
  const theme = getTheme(themeKey);
  if (!theme.cssVars) return baseCSS; // dark-orange IS the base — no changes needed

  const override = `\n/* ── Theme: ${theme.label} ── */\n:root {\n${theme.cssVars}\n}\n`;

  // Insert the override right after the closing brace of the first :root block
  const rootEndIdx = baseCSS.indexOf(':root {');
  if (rootEndIdx !== -1) {
    // Find the closing } of that :root block
    let depth = 0;
    let i = rootEndIdx;
    for (; i < baseCSS.length; i++) {
      if (baseCSS[i] === '{') depth++;
      else if (baseCSS[i] === '}') { depth--; if (depth === 0) { i++; break; } }
    }
    // Splice override in right after the base :root block
    return baseCSS.slice(0, i) + override + baseCSS.slice(i);
  }

  // Fallback: append at end
  return baseCSS + override;
}

module.exports = { THEMES, getTheme, listThemes, applyTheme };
