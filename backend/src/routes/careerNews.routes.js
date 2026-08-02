const router          = require('express').Router();
const expressRateLimit = require('express-rate-limit');
const { getNews }     = require('../controllers/careerNews.controller');

// 20 req / 15 min — RSS fetching + LLM is heavier than regular API
const newsLimiter = expressRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many news requests. Please wait.' },
});

router.get('/career', newsLimiter, getNews);

module.exports = router;
