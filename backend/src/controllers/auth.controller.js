const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { setAuthCookie, clearAuthCookie } = require('../middleware/auth');
const { randomToken, hashToken } = require('../utils/helpers');
const { sendMail, buildEmailHtml } = require('../services/email.service');
const env = require('../config/env');
const logger = require('../config/logger');

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

  const verificationToken = randomToken(32);
  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken: hashToken(verificationToken),
    verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
  });

  try {
    await sendMail({
      to: user.email,
      subject: 'Verify your email',
      html: buildEmailHtml(
        'Verify your email',
        `<p>Hi ${user.name},</p><p>Welcome to JobHive! Click the button below to verify your email address.</p>`,
        'Verify Email',
        getVerificationUrl(verificationToken)
      ),
    });
  } catch (err) {
    logger.warn(`[auth] verification email failed: ${err.message}`);
  }

  setAuthCookie(res, user._id);
  res.status(201).json({ success: true, message: 'Account created. Please verify your email.', user: user.toSafeJSON() });
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
  const { token } = req.body;
  const hashed = hashToken(token);
  const user = await User.findOne({
    verificationToken: hashed,
    verificationTokenExpires: { $gt: Date.now() },
  });
  if (!user) return next(new ApiError(400, 'Invalid or expired verification token.'));

  user.emailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Email verified successfully.', user: user.toSafeJSON() });
});

const resendVerification = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new ApiError(404, 'User not found.'));
  if (user.emailVerified) return res.json({ success: true, message: 'Email already verified.' });

  const verificationToken = randomToken(32);
  user.verificationToken = hashToken(verificationToken);
  user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
  await user.save();

  await sendMail({
    to: user.email,
    subject: 'Verify your email',
    html: buildEmailHtml(
      'Verify your email',
      `<p>Hi ${user.name},</p><p>Here is a fresh verification link for your JobHive account.</p>`,
      'Verify Email',
      getVerificationUrl(verificationToken)
    ),
  });

  res.json({ success: true, message: 'Verification email sent.' });
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
  } catch (err) {
    logger.warn(`[auth] google verification error: ${err.message}`);
    return next(new ApiError(401, 'Invalid Google token. Please try again.'));
  }

  const { sub: googleId, email, name, picture } = payload;
  if (!email) return next(new ApiError(401, 'Google account has no email.'));

  logger.info(`[auth] google login: email=${email}, name=${name}`);

  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
    }
    if (!user.avatar && picture) {
      user.avatar = picture;
    }
    await user.save();
  } else {
    user = await User.create({
      name: name || email.split('@')[0],
      email,
      googleId,
      avatar: picture || '',
      role: role === 'recruiter' ? 'recruiter' : 'candidate',
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
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  me,
  googleLogin,
};
