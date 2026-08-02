const router           = require('express').Router();
const expressRateLimit = require('express-rate-limit');
const { protect, authorize } = require('../middleware/auth');
const {
  publish,
  listDeployments,
  getDeployment,
  rollback,
  deleteDeployment,
  toggleDeployment,
  getQRCode,
  changeTheme,
} = require('../controllers/deployment.controller');

// 3 publish calls per 10 minutes (Gemini is slow + costly)
const publishLimiter = expressRateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many publish requests. Please wait 10 minutes.' },
});

// All routes require authentication and candidate role
router.use(protect, authorize('candidate'));

router.post('/publish',       publishLimiter, publish);
router.get('/',               listDeployments);
router.get('/:id',            getDeployment);
router.post('/:id/rollback',  rollback);
router.post('/:id/theme',     changeTheme);
router.delete('/:id',         deleteDeployment);
router.post('/:id/toggle',    toggleDeployment);
router.get('/:id/qr',         getQRCode);

module.exports = router;
