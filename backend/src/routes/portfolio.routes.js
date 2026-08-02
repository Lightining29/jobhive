const router       = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const expressRateLimit = require('express-rate-limit');
const { generate, getThemes } = require('../controllers/portfolio.controller');

// 5 generations per 15 min — AI calls are slow + costly
const portfolioLimiter = expressRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many portfolio generations. Please wait 15 minutes.' },
});

// Public — no auth needed to list available themes
router.get('/themes', getThemes);

router.post('/generate', protect, authorize('candidate'), portfolioLimiter, generate);

module.exports = router;
