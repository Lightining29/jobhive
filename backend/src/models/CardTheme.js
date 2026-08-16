const mongoose = require('mongoose');

const cardThemeSchema = new mongoose.Schema(
  {
    themeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, default: 'Custom' },
    description: { type: String, default: '' },
    isCustom: { type: Boolean, default: true },
    colors: {
      bgPrimary: String,
      bgSecondary: String,
      accent: String,
      accentSecondary: String,
      textPrimary: String,
      textSecondary: String,
      border: String,
      cardBg: String,
      glowColor: String,
      badgeBg: String,
      badgeText: String,
      badgeBorder: String,
    },
    background: {
      type: { type: String, default: 'gradient' },
      pattern: { type: String, default: 'grid' },
      overlay: String,
    },
    typography: {
      titleFont: { type: String, default: 'Space Grotesk' },
      bodyFont: { type: String, default: 'Inter' },
    },
    cardStyle: {
      borderRadius: { type: String, default: '1rem' },
      borderWidth: { type: String, default: '1px' },
      hasHologram: { type: Boolean, default: true },
      hasScanlines: { type: Boolean, default: false },
      hasGlow: { type: Boolean, default: true },
      chipStyle: { type: String, default: 'gold' },
      nfcStyle: { type: String, default: 'neon' },
      glassmorphism: { type: Boolean, default: false },
      shadow: { type: String, default: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CardTheme', cardThemeSchema);
