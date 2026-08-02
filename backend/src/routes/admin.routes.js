const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const admin = require('../controllers/admin.controller');
const {
  validateAdminAction,
  validateResolveReport,
} = require('../validators');

router.use(protect, authorize('admin'));

router.get('/dashboard', admin.dashboard);

router.get('/users', admin.listUsers);
router.patch('/users/:id', validateAdminAction, admin.updateUser);

router.get('/companies', admin.listCompanies);
router.patch('/companies/:id/verify', validateAdminAction, admin.verifyCompany);

router.get('/jobs', admin.listJobs);
router.patch('/jobs/:id', validateAdminAction, admin.moderateJob);
router.delete('/jobs/:id', admin.deleteJob);

router.get('/reports', admin.listReports);
router.patch('/reports/:id', validateResolveReport, admin.resolveReport);

module.exports = router;
