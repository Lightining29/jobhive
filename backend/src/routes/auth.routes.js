const router = require('express').Router();
const auth = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const {
  validateRegister,
  validateLogin,
  validateVerifyOtp,
  validateResendOtp,
  validateVerifyEmail,
  validateForgotPassword,
  validateResetPassword,
} = require('../validators');

router.post('/register', authLimiter, validateRegister, auth.register);
router.post('/login', authLimiter, validateLogin, auth.login);
router.post('/verify-otp', authLimiter, validateVerifyOtp, auth.verifyOtp);
router.post('/resend-otp', authLimiter, validateResendOtp, auth.resendOtp);
router.post('/google', authLimiter, auth.googleLogin);
router.post('/logout', auth.logout);
router.post('/verify-email', validateVerifyEmail, auth.verifyEmail);
router.post('/forgot-password', authLimiter, validateForgotPassword, auth.forgotPassword);
router.post('/reset-password', authLimiter, validateResetPassword, auth.resetPassword);
router.get('/me', protect, auth.me);

module.exports = router;
