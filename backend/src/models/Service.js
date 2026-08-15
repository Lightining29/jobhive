const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    icon: { type: String, default: 'FaBriefcase' },
    category: {
      type: String,
      enum: ['job_posting', 'candidate_access', 'branding', 'ai_tools', 'communication', 'verification', 'analytics', 'other'],
      default: 'job_posting',
      index: true,
    },
    price: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'USD' },
    durationDays: { type: Number, default: 30 }, // validity period
    usageLimit: { type: Number, default: 1 }, // e.g. 5 job posts or 50 profile views
    creditsGranted: { type: Number, default: 0 }, // contact or unlock credits
    taxPercent: { type: Number, default: 0, min: 0, max: 100 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    isSubscriptionOnly: { type: Boolean, default: false },
    canPurchaseSeparately: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
