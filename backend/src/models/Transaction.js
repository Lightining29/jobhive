const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    invoiceNumber: { type: String, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['subscription', 'service', 'bundle', 'credit_topup', 'custom'],
      required: true,
      index: true,
    },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    bundle: { type: mongoose.Schema.Types.ObjectId, ref: 'Bundle' },

    billingCycle: { type: String, enum: ['monthly', 'yearly', 'one_time'], default: 'one_time' },
    subtotal: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },

    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    couponCode: { type: String, default: '' },

    paymentMethod: { type: String, default: 'card' }, // card, razorpay, stripe, paypal, manual
    gatewayTransactionId: { type: String, default: '' },
    status: {
      type: String,
      enum: ['succeeded', 'pending', 'failed', 'refunded'],
      default: 'succeeded',
      index: true,
    },
    refundReason: { type: String, default: '' },
    refundedAt: { type: Date },

    autoRenew: { type: Boolean, default: false },
    nextBillingDate: { type: Date },
    periodStart: { type: Date, default: Date.now },
    periodEnd: { type: Date },

    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
