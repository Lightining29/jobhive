const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    monthlyPrice: { type: Number, default: 0, min: 0 },
    yearlyPrice: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'USD' },
    isFree: { type: Boolean, default: false },

    // Free Trial Configuration
    hasTrial: { type: Boolean, default: false },
    trialDays: { type: Number, default: 14, min: 0 }, // 7, 14, 30, or custom days
    trialOnlyForNewUsers: { type: Boolean, default: true },
    trialOncePerCompany: { type: Boolean, default: true },
    requirePaymentMethodForTrial: { type: Boolean, default: false },
    autoConvertToPaid: { type: Boolean, default: true },

    // Quotas & Features
    maxJobPosts: { type: Number, default: 5 }, // -1 for unlimited
    featuredJobsIncluded: { type: Number, default: 0 },
    urgentJobsIncluded: { type: Number, default: 0 },
    jobBoostsIncluded: { type: Number, default: 0 },
    candidateProfileViews: { type: Number, default: 20 },
    resumeDownloads: { type: Number, default: 10 },
    candidateContactCredits: { type: Number, default: 10 },
    companyPromotion: { type: Boolean, default: false },
    aiResumeScreening: { type: Boolean, default: false },
    aiCandidateMatching: { type: Boolean, default: false },
    recruitmentAnalytics: { type: Boolean, default: false },
    teamMembers: { type: Number, default: 1 },
    supportLevel: {
      type: String,
      enum: ['community', 'email', 'priority', 'dedicated_manager', '24_7_phone'],
      default: 'email',
    },

    includedServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    badgeText: { type: String, default: '' }, // e.g. "Most Popular"
    isPopular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
