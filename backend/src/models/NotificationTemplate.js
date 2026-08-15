const mongoose = require('mongoose');

const notificationTemplateSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
      unique: true,
      enum: [
        'welcome_user',
        'trial_started',
        'trial_expiring_soon',
        'subscription_activated',
        'subscription_renewed',
        'payment_success',
        'payment_failed',
        'job_approved',
        'job_rejected',
        'coupon_announcement',
        'interview_scheduled',
      ],
    },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    emailBody: { type: String, required: true },
    inAppBody: { type: String, required: true },
    variablesAvailable: [{ type: String }], // e.g. ['{{userName}}', '{{planName}}', '{{trialDays}}']
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('NotificationTemplate', notificationTemplateSchema);
