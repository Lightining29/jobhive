const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, buildPagination } = require('../utils/query');

const ROLE_PERMISSIONS_MAP = {
  super_admin: ['all', 'services', 'plans', 'coupons', 'bundles', 'users', 'jobs', 'companies', 'payments', 'reports', 'settings', 'roles', 'notifications'],
  finance_admin: ['payments', 'reports', 'plans', 'coupons', 'bundles'],
  job_moderator: ['jobs', 'companies', 'reports'],
  support_admin: ['users', 'jobs', 'companies', 'notifications'],
  marketing_admin: ['coupons', 'bundles', 'notifications', 'reports'],
};

const listAdminStaff = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = { role: 'admin' };

  const [staff, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, staff, pagination: buildPagination(page, limit, total), rolePermissions: ROLE_PERMISSIONS_MAP });
});

const updateAdminRole = asyncHandler(async (req, res, next) => {
  const { adminRole, permissions } = req.body;
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'admin') return next(new ApiError(404, 'Admin user not found.'));

  if (adminRole) {
    user.adminRole = adminRole;
    user.permissions = permissions || ROLE_PERMISSIONS_MAP[adminRole] || [];
  } else if (permissions) {
    user.permissions = permissions;
  }

  await user.save();
  res.json({ success: true, message: 'Admin role updated.', user: user.toSafeJSON() });
});

const promoteToAdmin = asyncHandler(async (req, res, next) => {
  const { userId, adminRole = 'support_admin', permissions } = req.body;
  const user = await User.findById(userId);
  if (!user) return next(new ApiError(404, 'User not found.'));

  user.role = 'admin';
  user.adminRole = adminRole;
  user.permissions = permissions || ROLE_PERMISSIONS_MAP[adminRole] || [];
  await user.save();

  res.json({ success: true, message: `${user.name} promoted to Admin.`, user: user.toSafeJSON() });
});

module.exports = {
  listAdminStaff,
  updateAdminRole,
  promoteToAdmin,
  ROLE_PERMISSIONS_MAP,
};
