const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'My Smart Identity Card' },
    cardType: {
      type: String,
      enum: ['business', 'student', 'event_badge', 'developer', 'creator', 'executive', 'medical', 'corporate', 'staff'],
      default: 'business',
    },
    orientation: {
      type: String,
      enum: ['horizontal', 'vertical'],
      default: 'horizontal',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'expired'],
      default: 'active',
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    issuedBy: {
      type: String,
      default: 'JobHive Official Identity Authority',
    },
    personal: {
      fullName: { type: String, default: 'Alex Rivera' },
      preferredName: { type: String, default: 'Alex' },
      pronouns: { type: String, default: 'they/them' },
      jobTitle: { type: String, default: 'Lead AI Engineer & Architect' },
      organization: { type: String, default: 'JobHive Technologies' },
      department: { type: String, default: 'Autonomous AI & Platform Labs' },
      idNumber: { type: String, default: 'JHV-9048-X' },
      validUntil: { type: String, default: '12/2028' },
      bloodGroup: { type: String, default: 'O+' },
      emergencyContact: { type: String, default: '+91 98765 43210' },
      bio: { type: String, default: 'Architecting neural synthesis platforms, cloud systems, and next-gen identity runtimes.' },
      tagline: { type: String, default: 'Building the Future of Digital Identity' },
      skills: [{ type: String }],
    },
    media: {
      avatarUrl: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80' },
      avatarType: { type: String, default: 'image' }, // 'image' | 'ai-generated' | 'initials'
      logoUrl: { type: String, default: '' },
      signatureUrl: { type: String, default: '/assets/signature.png' },
      coverBannerUrl: { type: String, default: '' },
    },
    contact: {
      email: { type: String, default: 'alex.rivera@jobhive.app' },
      phone: { type: String, default: '+91 98765 43210' },
      website: { type: String, default: 'https://jobhive.app' },
      location: { type: String, default: 'Delhi NCR, India' },
      address: { type: String, default: 'Cyber City, Gurugram, Haryana' },
    },
    socials: {
      github: { type: String, default: 'alexrivera-ai' },
      linkedin: { type: String, default: 'alexrivera-tech' },
      twitter: { type: String, default: 'alexrivera_ai' },
      instagram: { type: String, default: '' },
      telegram: { type: String, default: 'alex_apex' },
      discord: { type: String, default: 'alex.rivera#0001' },
      customLink: { type: String, default: '' },
      customLabel: { type: String, default: '' },
    },
    security: {
      barcodeNumber: { type: String, default: '984021948301' },
      hasSecurityChip: { type: Boolean, default: true },
      hasNfcSymbol: { type: Boolean, default: true },
      hasHologramStamp: { type: Boolean, default: true },
      hasMagneticStripe: { type: Boolean, default: true },
      hasSignatureStrip: { type: Boolean, default: true },
      badgeLabel: { type: String, default: 'VERIFIED IDENTITY' },
      badgeType: { type: String, default: 'verified' },
    },
    theme: {
      themeId: { type: String, default: 'cyberpunk' },
      isCustom: { type: Boolean, default: false },
      customConfig: {
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
          bodyFont: { type: String, default: 'JetBrains Mono' },
        },
        cardStyle: {
          borderRadius: { type: String, default: '1rem' },
          borderWidth: { type: String, default: '1.5px' },
          hasHologram: { type: Boolean, default: true },
          hasScanlines: { type: Boolean, default: true },
          hasGlow: { type: Boolean, default: true },
          chipStyle: { type: String, default: 'neon-cyan' },
          nfcStyle: { type: String, default: 'neon' },
          glassmorphism: { type: Boolean, default: true },
          shadow: { type: String, default: '0 25px 50px -12px rgba(0, 240, 255, 0.25)' },
        },
      },
    },
    qrSettings: {
      targetType: { type: String, enum: ['verify', 'vcard', 'url', 'custom'], default: 'verify' },
      customUrl: { type: String, default: '' },
      fgColor: { type: String, default: '#00f0ff' },
      bgColor: { type: String, default: 'transparent' },
      includeMargin: { type: Boolean, default: false },
      level: { type: String, default: 'M' },
    },
    analytics: {
      views: { type: Number, default: 0 },
      qrScans: { type: Number, default: 0 },
      vcardDownloads: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Card', cardSchema);
