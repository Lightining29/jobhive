const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const {
  generatePortfolio,
  getMyPortfolio,
  updateMyPortfolio,
  getPublicPortfolio,
} = require('../controllers/portfolio.controller');

// Public route for viewing portfolios without login
router.get('/public/:slug', getPublicPortfolio);
router.get('/:slug', getPublicPortfolio);

// Authenticated Candidate routes
router.post('/generate', protect, authorize('candidate'), generatePortfolio);
router.get('/', protect, authorize('candidate'), getMyPortfolio);
router.put('/', protect, authorize('candidate'), updateMyPortfolio);

module.exports = router;
