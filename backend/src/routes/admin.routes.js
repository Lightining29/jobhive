const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const admin = require('../controllers/admin.controller');
const services = require('../controllers/adminServices.controller');
const plans = require('../controllers/adminPlans.controller');
const coupons = require('../controllers/adminCoupons.controller');
const bundles = require('../controllers/adminBundles.controller');
const payments = require('../controllers/adminPayments.controller');
const reports = require('../controllers/adminReports.controller');
const settings = require('../controllers/adminSettings.controller');
const notifications = require('../controllers/adminNotifications.controller');
const roles = require('../controllers/adminRoles.controller');
const {
  validateAdminAction,
  validateResolveReport,
} = require('../validators');

// Protect all admin routes
router.use(protect, authorize('admin'));

// ── 1. Dashboard Overview ──────────────────────────────────────────────────
router.get('/dashboard', admin.dashboard);

// ── 2. Services Management ─────────────────────────────────────────────────
router.get('/services', services.listServices);
router.get('/services/:id', services.getService);
router.post('/services', services.createService);
router.put('/services/:id', services.updateService);
router.patch('/services/:id/toggle', services.toggleServiceStatus);
router.delete('/services/:id', services.deleteService);

// ── 3. Subscription Plans & Free Trials ────────────────────────────────────
router.get('/plans', plans.listPlans);
router.get('/plans/:id', plans.getPlan);
router.post('/plans', plans.createPlan);
router.put('/plans/:id', plans.updatePlan);
router.patch('/plans/:id/toggle', plans.togglePlanStatus);
router.delete('/plans/:id', plans.deletePlan);

// ── 4. Coupons & Discounts ─────────────────────────────────────────────────
router.get('/coupons', coupons.listCoupons);
router.get('/coupons/:id', coupons.getCoupon);
router.post('/coupons', coupons.createCoupon);
router.put('/coupons/:id', coupons.updateCoupon);
router.patch('/coupons/:id/toggle', coupons.toggleCouponStatus);
router.delete('/coupons/:id', coupons.deleteCoupon);

// ── 5. Service Bundles ─────────────────────────────────────────────────────
router.get('/bundles', bundles.listBundles);
router.get('/bundles/:id', bundles.getBundle);
router.post('/bundles', bundles.createBundle);
router.put('/bundles/:id', bundles.updateBundle);
router.delete('/bundles/:id', bundles.deleteBundle);

// ── 6. Users & Credit Management ───────────────────────────────────────────
router.get('/users', admin.listUsers);
router.get('/users/:id', admin.getUserDetails);
router.patch('/users/:id', validateAdminAction, admin.updateUser);
router.post('/users/:id/grant-credits', admin.grantUserCredits);
router.post('/users/:id/extend-trial', admin.extendUserTrial);
router.post('/users/:id/change-subscription', admin.changeUserSubscription);

// ── 7. Jobs & Moderation ───────────────────────────────────────────────────
router.get('/jobs', admin.listJobs);
router.patch('/jobs/:id', validateAdminAction, admin.moderateJob);
router.patch('/jobs/:id/featured', admin.toggleFeaturedJob);
router.delete('/jobs/:id', admin.deleteJob);

// ── 8. Companies Verification ──────────────────────────────────────────────
router.get('/companies', admin.listCompanies);
router.patch('/companies/:id/verify', validateAdminAction, admin.verifyCompany);

// ── 9. Payments & Invoices ─────────────────────────────────────────────────
router.get('/payments', payments.listTransactions);
router.get('/payments/:id', payments.getTransaction);
router.post('/payments/manual', payments.createManualTransaction);
router.patch('/payments/:id/refund', payments.refundTransaction);

// ── 10. Reports & Analytics ────────────────────────────────────────────────
router.get('/reports/analytics', reports.getAnalytics);
router.get('/reports/export', reports.exportCSV);

// ── 11. User Reports & Flags ───────────────────────────────────────────────
router.get('/reports', admin.listReports);
router.patch('/reports/:id', validateResolveReport, admin.resolveReport);

// ── 12. Roles & Permissions ────────────────────────────────────────────────
router.get('/roles/staff', roles.listAdminStaff);
router.put('/roles/staff/:id', roles.updateAdminRole);
router.post('/roles/promote', roles.promoteToAdmin);

// ── 13. Notifications & Templates ──────────────────────────────────────────
router.get('/notifications/templates', notifications.listTemplates);
router.put('/notifications/templates/:id', notifications.updateTemplate);
router.post('/notifications/broadcast', notifications.sendBroadcastNotification);

// ── 14. System Settings ────────────────────────────────────────────────────
router.get('/settings', settings.getSettings);
router.put('/settings', settings.updateSettings);

module.exports = router;
