import { ModernTechTheme } from './ModernTechTheme';
import { DarkOrangeTheme } from './DarkOrangeTheme';
import { CyberPinkTheme } from './CyberPinkTheme';
import { CleanLightTheme } from './CleanLightTheme';
import { LightPinkTheme } from './LightPinkTheme';
import { HackerTheme } from './HackerTheme';
import { ExecutiveTheme } from './ExecutiveTheme';

export const PORTFOLIO_THEMES = [
  {
    id: 'modern_tech',
    name: 'Cyber Neon',
    tag: 'NEON BLUE',
    description: 'Electric Sky Blue & Cyan laser borders with cyberpunk luminescence.',
    previewGradient: 'from-cyan-400 via-sky-500 to-blue-600',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
    isDark: true,
  },
  {
    id: 'dark_orange',
    name: 'Dark Orange',
    tag: 'EMBER FIRE',
    description: 'Obsidian Ember, Tangerine Lava & Golden Fire with dark obsidian depth.',
    previewGradient: 'from-orange-500 via-amber-500 to-red-600',
    badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-400/40',
    isDark: true,
  },
  {
    id: 'cyber_pink',
    name: 'Cyber Pink',
    tag: 'NEON PINK',
    description: 'Neon Hot Pink & Electric Magenta with radiant cyberpunk violet lasers.',
    previewGradient: 'from-[#ff2d87] via-rose-500 to-purple-600',
    badgeClass: 'bg-pink-500/20 text-pink-300 border-pink-400/40',
    isDark: true,
  },
  {
    id: 'clean_light',
    name: 'Clean Light',
    tag: 'MINIMALIST',
    description: 'Ultra-crisp Pearl White with Obsidian Charcoal typography & modern slate cards.',
    previewGradient: 'from-slate-100 via-blue-50 to-white',
    badgeClass: 'bg-slate-200 text-slate-800 border-slate-300',
    isDark: false,
  },
  {
    id: 'light_pink',
    name: 'Sakura Blush',
    tag: 'LIGHT PINK',
    description: 'Elegant Pastel Sakura, Rose Gold accents & soft blush floral aesthetic.',
    previewGradient: 'from-pink-200 via-rose-200 to-pink-300',
    badgeClass: 'bg-pink-100 text-pink-800 border-pink-300',
    isDark: false,
  },
  {
    id: 'hacker_matrix',
    name: 'Hacker Terminal',
    tag: 'TERMINAL',
    description: 'Phosphor Green Matrix console, Monospace typography & CRT scanlines.',
    previewGradient: 'from-emerald-500 via-green-600 to-teal-700',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    isDark: true,
  },
  {
    id: 'executive',
    name: 'Executive Navy',
    tag: 'CORPORATE',
    description: 'Midnight Navy Blue, Champagne Gold & Corporate prestige architecture.',
    previewGradient: 'from-blue-900 via-slate-900 to-slate-950',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    isDark: true,
  },
];

export const renderPortfolioTheme = (themeId, portfolio, isPreview = false) => {
  switch (themeId) {
    case 'dark_orange':
      return <DarkOrangeTheme portfolio={portfolio} isPreview={isPreview} />;
    case 'cyber_pink':
      return <CyberPinkTheme portfolio={portfolio} isPreview={isPreview} />;
    case 'clean_light':
      return <CleanLightTheme portfolio={portfolio} isPreview={isPreview} />;
    case 'light_pink':
      return <LightPinkTheme portfolio={portfolio} isPreview={isPreview} />;
    case 'hacker_matrix':
      return <HackerTheme portfolio={portfolio} isPreview={isPreview} />;
    case 'executive':
      return <ExecutiveTheme portfolio={portfolio} isPreview={isPreview} />;
    case 'modern_tech':
    default:
      return <ModernTechTheme portfolio={portfolio} isPreview={isPreview} />;
  }
};
