const Transaction = require('../models/Transaction');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, buildPagination } = require('../utils/query');

const listTransactions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.search) {
    const term = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { transactionId: { $regex: term, $options: 'i' } },
      { invoiceNumber: { $regex: term, $options: 'i' } },
      { couponCode: { $regex: term, $options: 'i' } },
    ];
  }

  const [transactions, total, revenueAgg] = await Promise.all([
    Transaction.find(filter)
      .populate('user', 'name email role company')
      .populate('plan', 'name monthlyPrice yearlyPrice')
      .populate('service', 'name price')
      .populate('bundle', 'name price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Transaction.countDocuments(filter),
    Transaction.aggregate([
      { $match: { status: 'succeeded' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalTax: { $sum: '$taxAmount' },
          totalDiscounts: { $sum: '$discountAmount' },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const stats = revenueAgg[0] || { totalRevenue: 0, totalTax: 0, totalDiscounts: 0, count: 0 };

  res.json({
    success: true,
    transactions,
    pagination: buildPagination(page, limit, total),
    stats,
  });
});

const getTransaction = asyncHandler(async (req, res, next) => {
  const tx = await Transaction.findById(req.params.id)
    .populate('user', 'name email role company')
    .populate('plan')
    .populate('service')
    .populate('bundle')
    .populate('coupon');

  if (!tx) return next(new ApiError(404, 'Transaction not found.'));
  res.json({ success: true, transaction: tx });
});

const refundTransaction = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;
  const tx = await Transaction.findById(req.params.id);
  if (!tx) return next(new ApiError(404, 'Transaction not found.'));

  if (tx.status === 'refunded') {
    return next(new ApiError(400, 'Transaction is already refunded.'));
  }

  tx.status = 'refunded';
  tx.refundReason = reason || 'Admin processed refund';
  tx.refundedAt = new Date();
  await tx.save();

  // If subscription transaction, revert user subscription
  if (tx.type === 'subscription' && tx.user) {
    const user = await User.findById(tx.user);
    if (user && user.subscription) {
      user.subscription.status = 'canceled';
      await user.save();
    }
  }

  res.json({ success: true, message: 'Transaction refunded successfully.', transaction: tx });
});

const createManualTransaction = asyncHandler(async (req, res, next) => {
  const { userId, type, planId, serviceId, bundleId, amount, currency, taxAmount, discountAmount, notes, paymentMethod, status } = req.body;

  const user = await User.findById(userId);
  if (!user) return next(new ApiError(404, 'User not found.'));

  const txCount = await Transaction.countDocuments();
  const txId = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const invNumber = `JW-INV-${String(txCount + 1001).padStart(6, '0')}`;

  const tx = await Transaction.create({
    transactionId: txId,
    invoiceNumber: invNumber,
    user: user._id,
    type: type || 'custom',
    plan: planId || undefined,
    service: serviceId || undefined,
    bundle: bundleId || undefined,
    subtotal: Number(amount) || 0,
    taxAmount: Number(taxAmount) || 0,
    discountAmount: Number(discountAmount) || 0,
    totalAmount: Number(amount) + (Number(taxAmount) || 0) - (Number(discountAmount) || 0),
    currency: currency || 'USD',
    paymentMethod: paymentMethod || 'manual',
    status: status || 'succeeded',
    notes: notes || 'Admin created transaction',
  });

  res.status(201).json({ success: true, message: 'Transaction recorded.', transaction: tx });
});

module.exports = {
  listTransactions,
  getTransaction,
  refundTransaction,
  createManualTransaction,
};
