const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { setAuthCookie, clearAuthCookie } = require('../middleware/auth');
const { randomToken, hashToken } = require('../utils/helpers');
const { sendMail, buildEmailHtml, buildOtpEmailHtml } = require('../services/email.service');
const env = require('../config/env');
const logger = require('../config/logger');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const getVerificationUrl = (token) =>
  `${env.clientUrl}/auth/verify-email?token=${token}`;

const getResetUrl = (token) =>
  `${env.clientUrl}/auth/reset-password?token=${token}`;

const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    if (!existing.emailVerified) {
      await existing.deleteOne();
    } else {
      return next(new ApiError(409, 'An account with this email already exists.'));
    }
  }

  const otp = generateOtp();
  const verificationToken = randomToken(32);
  const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  const user = await User.create({
    name,
    email,
    password,
    role: role === 'recruiter' ? 'recruiter' : 'candidate',
    emailVerified: false,
    verificationOtp: hashToken(otp),
    verificationOtpExpires: otpExpiry,
    verificationToken: hashToken(verificationToken),
    verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
  });

  logger.info(`[auth] Registration successful for ${user.email}. OTP: ${otp}`);

  try {
    await sendMail({
      to: user.email,
      toName: user.name,
      subject: `Your JobHive Verification Code: ${otp}`,
      html: buildOtpEmailHtml({
        name: user.name,
        otp,
        expiryMinutes: 10,
      }),
    });
  } catch (err) {
    logger.warn(`[auth] OTP verification email failed: ${err.message}`);
  }

  // Set auth cookie so session is initialized, but emailVerified remains false until OTP verified
  setAuthCookie(res, user._id);
  res.status(201).json({
    success: true,
    message: 'Account created! Please enter the 6-digit OTP sent to your email.',
    email: user.email,
    user: user.toSafeJSON(),
  });
});

const verifyOtp = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return next(new ApiError(400, 'Email and 6-digit OTP are required.'));
  }

  const hashedOtp = hashToken(String(otp).trim());
  const user = await User.findOne({
    email: String(email).toLowerCase().trim(),
    verificationOtp: hashedOtp,
    verificationOtpExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError(400, 'Invalid or expired OTP code. Please request a new code.'));
  }

  user.emailVerified = true;
  user.verificationOtp = undefined;
  user.verificationOtpExpires = undefined;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  setAuthCookie(res, user._id);
  res.json({
    success: true,
    message: 'Email verified successfully! Welcome to JobHive.',
    user: user.toSafeJSON(),
  });
});

const resendOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new ApiError(400, 'Email is required to resend OTP.'));
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user) {
    return next(new ApiError(404, 'No account found with this email address.'));
  }

  if (user.emailVerified) {
    return res.json({ success: true, message: 'Email is already verified.' });
  }

  const otp = generateOtp();
  user.verificationOtp = hashToken(otp);
  user.verificationOtpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  logger.info(`[auth] Resent OTP for ${user.email}. New OTP: ${otp}`);

  try {
    await sendMail({
      to: user.email,
      toName: user.name,
      subject: `Your JobHive Verification Code: ${otp}`,
      html: buildOtpEmailHtml({
        name: user.name,
        otp,
        expiryMinutes: 10,
      }),
    });
  } catch (err) {
    logger.warn(`[auth] Resend OTP email failed: ${err.message}`);
  }

  res.json({
    success: true,
    message: 'A fresh 6-digit verification code has been sent to your email.',
  });
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new ApiError(401, 'Invalid email or password.'));
  }
  if (user.status === 'suspended') {
    return next(new ApiError(403, 'Your account has been suspended.'));
  }

  setAuthCookie(res, user._id);
  res.json({ success: true, message: 'Logged in successfully.', user: user.toSafeJSON() });
});

const logout = (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Logged out successfully.' });
};

const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token, email, otp } = req.body;

  // Support OTP verification through verifyEmail endpoint as well
  if (email && otp) {
    const hashedOtp = hashToken(String(otp).trim());
    const user = await User.findOne({
      email: String(email).toLowerCase().trim(),
      verificationOtp: hashedOtp,
      verificationOtpExpires: { $gt: Date.now() },
    });
    if (!user) return next(new ApiError(400, 'Invalid or expired OTP code.'));

    user.emailVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    setAuthCookie(res, user._id);
    return res.json({ success: true, message: 'Email verified successfully.', user: user.toSafeJSON() });
  }

  if (!token) return next(new ApiError(400, 'Verification token or OTP is required.'));

  const hashed = hashToken(token);
  const user = await User.findOne({
    verificationToken: hashed,
    verificationTokenExpires: { $gt: Date.now() },
  });
  if (!user) return next(new ApiError(400, 'Invalid or expired verification link.'));

  user.emailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  user.verificationOtp = undefined;
  user.verificationOtpExpires = undefined;
  await user.save();

  setAuthCookie(res, user._id);
  res.json({ success: true, message: 'Email verified successfully.', user: user.toSafeJSON() });
});

const resendVerification = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user?._id) || await User.findOne({ email: req.body.email });
  if (!user) return next(new ApiError(404, 'User not found.'));
  if (user.emailVerified) return res.json({ success: true, message: 'Email already verified.' });

  const otp = generateOtp();
  const verificationToken = randomToken(32);
  user.verificationOtp = hashToken(otp);
  user.verificationOtpExpires = Date.now() + 10 * 60 * 1000;
  user.verificationToken = hashToken(verificationToken);
  user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
  await user.save();

  await sendMail({
    to: user.email,
    subject: `Your JobHive Verification Code: ${otp}`,
    html: buildOtpEmailHtml({
      name: user.name,
      otp,
      expiryMinutes: 10,
    }),
  });

  res.json({ success: true, message: 'Verification OTP sent to your email.' });
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    const resetToken = randomToken(32);
    user.resetPasswordToken = hashToken(resetToken);
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    await sendMail({
      to: user.email,
      subject: 'Reset your password',
      html: buildEmailHtml(
        'Reset your password',
        '<p>You requested a password reset. This link expires in 1 hour.</p>',
        'Reset Password',
        getResetUrl(resetToken)
      ),
    });
  }
  res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const { token, password } = req.body;
  const hashed = hashToken(token);
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) return next(new ApiError(400, 'Invalid or expired reset token.'));

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  setAuthCookie(res, user._id);
  res.json({ success: true, message: 'Password reset successfully.', user: user.toSafeJSON() });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('company');
  res.json({ success: true, user: user.toSafeJSON() });
});

const googleLogin = asyncHandler(async (req, res, next) => {
  const { credential, role } = req.body;
  if (!credential) return next(new ApiError(400, 'Google credential is required.'));

  let payload;
  try {
    const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!resp.ok) {
      const text = await resp.text();
      logger.warn(`[auth] google tokeninfo failed: ${resp.status} ${text}`);
      throw new Error(`token verification failed: ${resp.status}`);
    }
    payload = await resp.json();
    logger.info(`[auth] google login: email=${payload.email}`);
  } catch (err) {
    logger.warn(`[auth] google verification error: ${err.message}`);
    return next(new ApiError(401, 'Invalid Google token. Please try again.'));
  }

  const { sub: googleId, email, name, picture } = payload;
  if (!email) return next(new ApiError(401, 'Google account has no email.'));

  let user = await User.findOne({ $or: [{ googleId }, { email }] });
  if (user) {
    if (!user.googleId) user.googleId = googleId;
    if (!user.avatar && picture) user.avatar = picture;
    await user.save();
  } else {
    user = await User.create({
      name:          name || email.split('@')[0],
      email,
      googleId,
      avatar:        picture || '',
      role:          role === 'recruiter' ? 'recruiter' : 'candidate',
      emailVerified: true,
    });
  }

  if (user.status === 'suspended') {
    return next(new ApiError(403, 'Your account has been suspended.'));
  }

  setAuthCookie(res, user._id);
  res.json({ success: true, message: 'Logged in with Google.', user: user.toSafeJSON() });
});

module.exports = {
  register,
  login,
  logout,
  verifyOtp,
  resendOtp,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  me,
  googleLogin,
};
