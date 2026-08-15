const Coupon = require('../models/Coupon');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, buildPagination } = require('../utils/query');

const DEFAULT_COUPONS = [
  {
    code: 'WELCOME30',
    name: 'New Employer Welcome Discount',
    description: '30% discount on any subscription plan or service purchase',
    discountType: 'percentage',
    discountValue: 30,
    maxDiscountAmount: 100,
    minPurchaseAmount: 50,
    userType: 'new_users',
    totalUsageLimit: 1000,
    perUserLimit: 1,
    startsAt: new Date(),
    expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
  },
  {
    code: 'FREE30',
    name: '30-Day Free Trial Extension',
    description: 'Grants an additional 30 days of free trial on any subscription plan',
    discountType: 'free_trial_extension',
    freeTrialDays: 30,
    userType: 'employers_only',
    totalUsageLimit: 500,
    perUserLimit: 1,
    startsAt: new Date(),
  },
  {
    code: 'EMPLOYER100',
    name: '100% Free First Month Promo',
    description: '100% discount on first month of Professional plan',
    discountType: 'percentage',
    discountValue: 100,
    maxDiscountAmount: 79,
    userType: 'new_users',
    totalUsageLimit: 250,
    perUserLimit: 1,
    startsAt: new Date(),
  },
  {
    code: 'FLAT50OFF',
    name: '$50 Off Any Premium Service',
    description: 'Flat $50 off on service bundles and annual subscriptions',
    discountType: 'fixed',
    discountValue: 50,
    minPurchaseAmount: 100,
    userType: 'all',
    totalUsageLimit: 2000,
    perUserLimit: 2,
    startsAt: new Date(),
  },
];

const seedCouponsIfEmpty = async () => {
  const count = await Coupon.countDocuments();
  if (count === 0) {
    await Coupon.insertMany(DEFAULT_COUPONS);
  }
};

const listCoupons = asyncHandler(async (req, res) => {
  await seedCouponsIfEmpty();
  const { page, limit, skip } = paginate(req.query);
  const filter = {};

  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
  if (req.query.discountType) filter.discountType = req.query.discountType;
  if (req.query.search) {
    const term = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [{ code: { $regex: term, $options: 'i' } }, { name: { $regex: term, $options: 'i' } }];
  }

  const [coupons, total, metrics] = await Promise.all([
    Coupon.find(filter).populate('usedBy.user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Coupon.countDocuments(filter),
    Coupon.aggregate([
      {
        $group: {
          _id: null,
          totalDiscountGiven: { $sum: '$totalDiscountGiven' },
          totalRevenueGenerated: { $sum: '$revenueGenerated' },
          totalRedemptions: { $sum: '$timesUsed' },
        },
      },
    ]),
  ]);

  const stats = metrics[0] || { totalDiscountGiven: 0, totalRevenueGenerated: 0, totalRedemptions: 0 };

  res.json({ success: true, coupons, pagination: buildPagination(page, limit, total), stats });
});

const getCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id).populate('usedBy.user', 'name email role company');
  if (!coupon) return next(new ApiError(404, 'Coupon not found.'));
  res.json({ success: true, coupon });
});

const createCoupon = asyncHandler(async (req, res, next) => {
  const { code, name, description, discountType, discountValue, maxDiscountAmount, minPurchaseAmount, freeTrialDays, freeServiceId, userType, applicablePlans, applicableServices, totalUsageLimit, perUserLimit, startsAt, expiresAt, isActive } = req.body;

  if (!code || !name) return next(new ApiError(400, 'Coupon code and name are required.'));

  const cleanCode = code.toUpperCase().trim();
  const exists = await Coupon.findOne({ code: cleanCode });
  if (exists) return next(new ApiError(409, 'A coupon with this code already exists.'));

  const coupon = await Coupon.create({
    code: cleanCode,
    name,
    description: description || '',
    discountType: discountType || 'percentage',
    discountValue: Number(discountValue) || 0,
    maxDiscountAmount: Number(maxDiscountAmount) || 0,
    minPurchaseAmount: Number(minPurchaseAmount) || 0,
    freeTrialDays: Number(freeTrialDays) || 0,
    freeServiceId: freeServiceId || undefined,
    userType: userType || 'all',
    applicablePlans: applicablePlans || [],
    applicableServices: applicableServices || [],
    totalUsageLimit: Number(totalUsageLimit) || 0,
    perUserLimit: Number(perUserLimit) || 1,
    startsAt: startsAt ? new Date(startsAt) : new Date(),
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  res.status(201).json({ success: true, message: 'Coupon created successfully.', coupon });
});

const updateCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return next(new ApiError(404, 'Coupon not found.'));

  const fields = [
    'name', 'description', 'discountType', 'discountValue', 'maxDiscountAmount',
    'minPurchaseAmount', 'freeTrialDays', 'freeServiceId', 'userType',
    'applicablePlans', 'applicableServices', 'totalUsageLimit', 'perUserLimit',
    'startsAt', 'expiresAt', 'isActive',
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) coupon[field] = req.body[field];
  });

  if (req.body.code && req.body.code.toUpperCase().trim() !== coupon.code) {
    const cleanCode = req.body.code.toUpperCase().trim();
    const exists = await Coupon.findOne({ code: cleanCode, _id: { $ne: coupon._id } });
    if (exists) return next(new ApiError(409, 'Coupon code is already in use.'));
    coupon.code = cleanCode;
  }

  await coupon.save();
  res.json({ success: true, message: 'Coupon updated successfully.', coupon });
});

const toggleCouponStatus = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return next(new ApiError(404, 'Coupon not found.'));

  coupon.isActive = !coupon.isActive;
  await coupon.save();
  res.json({ success: true, message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}.`, coupon });
});

const deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return next(new ApiError(404, 'Coupon not found.'));
  res.json({ success: true, message: 'Coupon deleted successfully.' });
});

module.exports = {
  listCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
};
