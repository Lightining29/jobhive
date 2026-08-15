const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Transaction = require('../models/Transaction');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Coupon = require('../models/Coupon');
const Service = require('../models/Service');
const asyncHandler = require('../utils/asyncHandler');

const getAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  const [
    revenueByMonth,
    revenueByType,
    subscriptionsByPlan,
    trialUsersCount,
    activePaidSubscriptionsCount,
    recentTransactions,
    topServicesPurchased,
    topCouponsUsed,
    jobsByMonth,
    applicationsByMonth,
  ] = await Promise.all([
    Transaction.aggregate([
      { $match: { status: 'succeeded', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Transaction.aggregate([
      { $match: { status: 'succeeded' } },
      {
        $group: {
          _id: '$type',
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
    ]),
    User.aggregate([
      { $match: { 'subscription.status': { $in: ['active', 'trial'] } } },
      {
        $group: {
          _id: '$subscription.planName',
          count: { $sum: 1 },
          isTrial: { $sum: { $cond: [{ $eq: ['$subscription.isTrial', true] }, 1, 0] } },
        },
      },
    ]),
    User.countDocuments({ 'subscription.isTrial': true, 'subscription.status': 'trial' }),
    User.countDocuments({ 'subscription.isTrial': false, 'subscription.status': 'active' }),
    Transaction.find({ status: 'succeeded' }).sort({ createdAt: -1 }).limit(10).populate('user', 'name email role').lean(),
    Transaction.aggregate([
      { $match: { status: 'succeeded', type: 'service', service: { $exists: true } } },
      { $group: { _id: '$service', totalSales: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),
    Coupon.find().sort({ timesUsed: -1 }).limit(6).select('code name timesUsed totalDiscountGiven revenueGenerated').lean(),
    Job.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Application.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // Calculate MRR (Monthly Recurring Revenue)
  const activeSubs = await User.find({ 'subscription.status': 'active', 'subscription.isTrial': false }).populate('subscription.plan').lean();
  const mrr = activeSubs.reduce((acc, u) => acc + (u.subscription?.plan?.monthlyPrice || 0), 0);

  // Conversion rate (trial to paid)
  const totalTrialsHistorical = await User.countDocuments({ 'subscription.trialEndsAt': { $exists: true } });
  const trialToPaidConversion = totalTrialsHistorical > 0 ? Math.round((activePaidSubscriptionsCount / totalTrialsHistorical) * 100) : 0;

  res.json({
    success: true,
    analytics: {
      mrr,
      activePaidSubscriptionsCount,
      trialUsersCount,
      trialToPaidConversion,
      revenueByMonth,
      revenueByType,
      subscriptionsByPlan,
      recentTransactions,
      topServicesPurchased,
      topCouponsUsed,
      jobsByMonth,
      applicationsByMonth,
    },
  });
});

const exportCSV = asyncHandler(async (req, res) => {
  const { type = 'revenue' } = req.query;

  let csvRows = [];
  let filename = `jobworkplace_${type}_${Date.now()}.csv`;

  if (type === 'revenue' || type === 'transactions') {
    const txs = await Transaction.find().sort({ createdAt: -1 }).populate('user', 'name email').lean();
    csvRows.push(['Transaction ID', 'Invoice', 'User Name', 'User Email', 'Type', 'Amount', 'Tax', 'Discount', 'Status', 'Date'].join(','));
    txs.forEach((tx) => {
      csvRows.push([
        `"${tx.transactionId}"`,
        `"${tx.invoiceNumber || ''}"`,
        `"${(tx.user && tx.user.name) || 'N/A'}"`,
        `"${(tx.user && tx.user.email) || 'N/A'}"`,
        `"${tx.type}"`,
        tx.totalAmount,
        tx.taxAmount || 0,
        tx.discountAmount || 0,
        `"${tx.status}"`,
        `"${new Date(tx.createdAt).toISOString()}"`,
      ].join(','));
    });
  } else if (type === 'users') {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    csvRows.push(['User ID', 'Name', 'Email', 'Role', 'Status', 'Plan', 'Is Trial', 'Credits JobPosts', 'Created At'].join(','));
    users.forEach((u) => {
      csvRows.push([
        `"${u._id}"`,
        `"${u.name}"`,
        `"${u.email}"`,
        `"${u.role}"`,
        `"${u.status}"`,
        `"${u.subscription?.planName || 'Free'}"`,
        u.subscription?.isTrial ? 'Yes' : 'No',
        u.credits?.jobPosts || 0,
        `"${new Date(u.createdAt).toISOString()}"`,
      ].join(','));
    });
  } else if (type === 'jobs') {
    const jobs = await Job.find().sort({ createdAt: -1 }).lean();
    csvRows.push(['Job ID', 'Title', 'Company', 'Category', 'Source', 'Work Mode', 'Salary Max', 'Is Active', 'Created At'].join(','));
    jobs.forEach((j) => {
      csvRows.push([
        `"${j.jobId}"`,
        `"${j.jobTitle.replace(/"/g, '""')}"`,
        `"${j.companyName.replace(/"/g, '""')}"`,
        `"${j.category || ''}"`,
        `"${j.source || ''}"`,
        `"${j.workMode || ''}"`,
        j.salaryMax || 0,
        j.isActive ? 'Active' : 'Inactive',
        `"${new Date(j.createdAt).toISOString()}"`,
      ].join(','));
    });
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send(csvRows.join('\n'));
});

module.exports = {
  getAnalytics,
  exportCSV,
};
