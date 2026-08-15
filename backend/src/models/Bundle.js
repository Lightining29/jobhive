const mongoose = require('mongoose');

const bundleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    validityDays: { type: Number, default: 30 },

    // Included services & credits
    includedServices: [
      {
        service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
        quantity: { type: Number, default: 1 },
      },
    ],
    jobPostsIncluded: { type: Number, default: 0 },
    featuredJobsIncluded: { type: Number, default: 0 },
    urgentJobsIncluded: { type: Number, default: 0 },
    profileViewsIncluded: { type: Number, default: 0 },
    resumeDownloadsIncluded: { type: Number, default: 0 },
    contactCreditsIncluded: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true, index: true },
    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    timesPurchased: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bundle', bundleSchema);
