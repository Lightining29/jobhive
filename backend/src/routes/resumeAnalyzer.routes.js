/**
 * Resume Analyzer routes
 * All routes require candidate authentication.
 */
const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadResume }       = require('../middleware/upload');
const expressRateLimit       = require('express-rate-limit');
const { analyze }            = require('../controllers/resumeAnalyzer.controller');

// 10 analyses per 15 minutes — AI calls are expensive
const analyzerLimiter = expressRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many analysis requests. Please wait 15 minutes.' },
});

router.post(
  '/analyze',
  protect,
  authorize('candidate'),
  analyzerLimiter,
  uploadResume.single('resume'),
  analyze
);

module.exports = router;
