const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'global_settings' },
    siteName: { type: String, default: 'Job Workplace' },
    siteLogo: { type: String, default: '' },
    tagline: { type: String, default: 'Find Your Dream Career with AI Precision' },
    supportEmail: { type: String, default: 'support@jobworkplace.com' },
    contactPhone: { type: String, default: '+1 (800) 555-0199' },
    currency: { type: String, default: 'USD' },
    currencySymbol: { type: String, default: '$' },

    // Taxes & Invoicing
    defaultTaxRate: { type: Number, default: 18, min: 0, max: 100 }, // GST/VAT percentage
    taxName: { type: String, default: 'GST' },
    invoicePrefix: { type: String, default: 'JW-INV' },
    invoiceFooterNote: { type: String, default: 'Thank you for choosing Job Workplace.' },

    // Free Trial Global Defaults
    defaultTrialDays: { type: Number, default: 14 },
    allowTrialExtensions: { type: Boolean, default: true },
    maxTrialExtensionDays: { type: Number, default: 30 },
    requirePaymentForTrial: { type: Boolean, default: false },

    // Pricing & Payment Gateways
    stripeEnabled: { type: Boolean, default: true },
    razorpayEnabled: { type: Boolean, default: true },
    paypalEnabled: { type: Boolean, default: false },
    currencyExchangeRates: {
      type: Map,
      of: Number,
      default: { USD: 1.0, INR: 83.5, EUR: 0.92, GBP: 0.79 },
    },

    // Moderation & Platform Defaults
    jobAutoApproval: { type: Boolean, default: true },
    companyAutoVerification: { type: Boolean, default: false },
    candidateDefaultContactCredits: { type: Number, default: 5 },
    employerDefaultJobCredits: { type: Number, default: 3 },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: 'Job Workplace is undergoing scheduled maintenance. We will be right back!' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
