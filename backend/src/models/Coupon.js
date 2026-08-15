const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed', 'free_trial_extension', 'free_subscription', 'free_service'],
      required: true,
      default: 'percentage',
    },
    discountValue: { type: Number, default: 0, min: 0 }, // e.g. 30 (for 30%) or $50 (fixed)
    maxDiscountAmount: { type: Number, default: 0 }, // cap for percentage discount
    minPurchaseAmount: { type: Number, default: 0 },
    freeTrialDays: { type: Number, default: 0 }, // for trial extension
    freeServiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },

    // Audience targeting
    userType: {
      type: String,
      enum: ['all', 'new_users', 'existing_users', 'employers_only', 'candidates_only'],
      default: 'all',
    },
    applicablePlans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan' }],
    applicableServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],

    // Limits & Tracking
    totalUsageLimit: { type: Number, default: 0 }, // 0 for unlimited
    perUserLimit: { type: Number, default: 1 },
    timesUsed: { type: Number, default: 0 },
    totalDiscountGiven: { type: Number, default: 0 },
    revenueGenerated: { type: Number, default: 0 },
    usedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amountSaved: { type: Number, default: 0 },
        orderAmount: { type: Number, default: 0 },
        usedAt: { type: Date, default: Date.now },
      },
    ],

    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
