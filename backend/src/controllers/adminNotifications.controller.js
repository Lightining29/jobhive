const NotificationTemplate = require('../models/NotificationTemplate');
const Notification = require('../models/Notification');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const DEFAULT_TEMPLATES = [
  {
    event: 'welcome_user',
    title: 'Welcome to Job Workplace',
    subject: 'Welcome to Job Workplace — Let’s kickstart your journey!',
    emailBody: 'Hi {{userName}},\n\nWelcome to Job Workplace! Your account has been created successfully. Explore verified jobs, upload your resume, and connect with top employers.',
    inAppBody: 'Welcome to Job Workplace! Complete your profile to get matched with top opportunities.',
    variablesAvailable: ['{{userName}}', '{{userEmail}}', '{{userRole}}'],
  },
  {
    event: 'trial_started',
    title: 'Free Trial Activated',
    subject: 'Your {{planName}} free trial is now active!',
    emailBody: 'Hi {{userName}},\n\nYour {{planName}} {{trialDays}}-day free trial is now live! Start posting featured jobs and accessing verified candidate resumes with zero commitment.',
    inAppBody: 'Your {{planName}} {{trialDays}}-day free trial is now active. Enjoy full enterprise features!',
    variablesAvailable: ['{{userName}}', '{{planName}}', '{{trialDays}}', '{{expiryDate}}'],
  },
  {
    event: 'trial_expiring_soon',
    title: 'Free Trial Expiring Soon',
    subject: 'Your free trial expires in {{daysLeft}} days — Keep your hiring active',
    emailBody: 'Hi {{userName}},\n\nYour {{planName}} free trial ends on {{expiryDate}}. Upgrade now to keep accessing resume downloads and active candidate applications.',
    inAppBody: 'Your {{planName}} trial ends in {{daysLeft}} days. Upgrade to maintain uninterrupted access.',
    variablesAvailable: ['{{userName}}', '{{planName}}', '{{daysLeft}}', '{{expiryDate}}'],
  },
  {
    event: 'subscription_renewed',
    title: 'Subscription Renewed Successfully',
    subject: 'Receipt: Your {{planName}} subscription has been renewed',
    emailBody: 'Hi {{userName}},\n\nThank you! Your {{planName}} subscription has been renewed successfully. Amount: {{amount}} {{currency}}.',
    inAppBody: 'Your {{planName}} subscription has been renewed. Quotas and credits refreshed.',
    variablesAvailable: ['{{userName}}', '{{planName}}', '{{amount}}', '{{currency}}', '{{nextBillingDate}}'],
  },
  {
    event: 'job_approved',
    title: 'Job Posting Approved',
    subject: 'Your job "{{jobTitle}}" is now live on Job Workplace',
    emailBody: 'Hi {{userName}},\n\nGreat news! Your job posting "{{jobTitle}}" has been approved and is now receiving candidate applications.',
    inAppBody: 'Your job "{{jobTitle}}" is now active and live.',
    variablesAvailable: ['{{userName}}', '{{jobTitle}}', '{{companyName}}', '{{jobUrl}}'],
  },
  {
    event: 'coupon_announcement',
    title: 'Exclusive Discount Available',
    subject: 'Special Offer: Use code {{couponCode}} for {{discountText}} off!',
    emailBody: 'Hi {{userName}},\n\nClaim your exclusive offer! Use coupon code {{couponCode}} during checkout to get {{discountText}} off.',
    inAppBody: 'Special Offer! Use coupon code {{couponCode}} for {{discountText}} discount.',
    variablesAvailable: ['{{userName}}', '{{couponCode}}', '{{discountText}}', '{{expiresAt}}'],
  },
];

const seedTemplatesIfEmpty = async () => {
  const count = await NotificationTemplate.countDocuments();
  if (count === 0) {
    await NotificationTemplate.insertMany(DEFAULT_TEMPLATES);
  }
};

const listTemplates = asyncHandler(async (req, res) => {
  await seedTemplatesIfEmpty();
  const templates = await NotificationTemplate.find().sort({ createdAt: 1 }).lean();
  res.json({ success: true, templates });
});

const updateTemplate = asyncHandler(async (req, res, next) => {
  const template = await NotificationTemplate.findById(req.params.id);
  if (!template) return next(new ApiError(404, 'Template not found.'));

  const fields = ['title', 'subject', 'emailBody', 'inAppBody', 'isActive'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) template[field] = req.body[field];
  });

  await template.save();
  res.json({ success: true, message: 'Template updated successfully.', template });
});

const sendBroadcastNotification = asyncHandler(async (req, res, next) => {
  const { title, message, targetRole = 'all', link } = req.body;
  if (!title || !message) return next(new ApiError(400, 'Title and message are required.'));

  const filter = {};
  if (targetRole === 'candidates') filter.role = 'candidate';
  else if (targetRole === 'employers') filter.role = 'recruiter';

  const users = await User.find(filter).select('_id');
  if (users.length === 0) {
    return res.json({ success: true, message: 'No users matched the criteria.', sentCount: 0 });
  }

  const notifications = users.map((u) => ({
    user: u._id,
    type: 'broadcast',
    title,
    message,
    link: link || '/notifications',
  }));

  await Notification.insertMany(notifications);
  res.json({ success: true, message: `Notification broadcast sent to ${users.length} users.`, sentCount: users.length });
});

module.exports = {
  listTemplates,
  updateTemplate,
  sendBroadcastNotification,
};
