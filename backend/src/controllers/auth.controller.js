const UserSQL = require('../models/sql/User.sql');
const PendingUserSQL = require('../models/sql/PendingUser.sql');
const { Op } = require('sequelize');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { setAuthCookie, clearAuthCookie } = require('../middleware/auth');
const { randomToken, hashToken } = require('../utils/helpers');
const { sendMail, buildEmailHtml, buildOtpEmailHtml } = require('../services/email.service');
const env = require('../config/env');
const logger = require('../config/logger');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const getResetUrl = (token) =>
  `${env.clientUrl}/auth/reset-password?token=${token}`;

// Step 1: Validate signup details and send OTP before creating the account in database
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const normalizedEmail = String(email).toLowerCase().trim();

  // Check if a registered user already exists in MySQL
  const existingUser = await UserSQL.findOne({ where: { email: normalizedEmail } });
  if (existingUser) {
    if (existingUser.emailVerified) {
      return next(new ApiError(409, 'An account with this email already exists. Please log in.'));
    }
    // If old unverified user exists, remove it so new registration can proceed cleanly
    await existingUser.destroy();
  }

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Save/replace pending signup record in MySQL (NO official User record created yet)
  await PendingUserSQL.destroy({ where: { email: normalizedEmail } });
  await PendingUserSQL.create({
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
    await PendingUserSQL.destroy({ where: { email: normalizedEmail } });
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

  // 1. Check PendingUser in MySQL
  const pending = await PendingUserSQL.findOne({
    where: {
      email: normalizedEmail,
      expiresAt: { [Op.gt]: new Date() },
    },
  });

  if (pending) {
    if (pending.otp !== hashedOtp) {
      return next(new ApiError(400, 'Invalid verification code. Please check and try again.'));
    }

    // Ensure user does not already exist
    const existing = await UserSQL.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      await PendingUserSQL.destroy({ where: { email: normalizedEmail } });
      return next(new ApiError(409, 'An account with this email already exists.'));
    }

    // Create the official verified User record in MySQL
    const user = await UserSQL.create({
      name: pending.name,
      email: pending.email,
      password: pending.password, // Already bcrypt hashed
      role: pending.role || 'candidate',
      emailVerified: true,
    });

    // Delete pending record
    await PendingUserSQL.destroy({ where: { email: normalizedEmail } });

    logger.info(`[auth] Account successfully created and verified for ${user.email} (ID: ${user.id})`);

    // Initialize session cookie
    setAuthCookie(res, user.id);
    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to JobHive.',
      user: user.toSafeJSON(),
    });
  }

  // 2. Fallback: check if existing user with verificationOtp in MySQL
  const existingUser = await UserSQL.findOne({
    where: {
      email: normalizedEmail,
      verificationOtp: hashedOtp,
      verificationOtpExpires: { [Op.gt]: new Date() },
    },
  });

  if (existingUser) {
    existingUser.emailVerified = true;
    existingUser.verificationOtp = null;
    existingUser.verificationOtpExpires = null;
    existingUser.verificationToken = null;
    existingUser.verificationTokenExpires = null;
    await existingUser.save();

    setAuthCookie(res, existingUser.id);
    return res.json({
      success: true,
      message: 'Email verified successfully! Welcome to JobHive.',
      user: existingUser.toSafeJSON(),
    });
  }

  // 3. Fallback: If client supplied registration details directly with valid OTP fallback
  if (name && password) {
    const user = await UserSQL.create({
      name,
      email: normalizedEmail,
      password,
      role: role === 'recruiter' ? 'recruiter' : 'candidate',
      emailVerified: true,
    });
    setAuthCookie(res, user.id);
    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to JobHive.',
      user: user.toSafeJSON(),
    });
  }

  return next(new ApiError(400, 'Verification code is invalid or has expired. Please request a new code.'));
});

// Resend OTP for either pending signup or existing account in MySQL
const resendOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new ApiError(400, 'Email is required to resend OTP.'));
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  // Check if real user already exists
  const existingUser = await UserSQL.findOne({ where: { email: normalizedEmail } });
  if (existingUser && existingUser.emailVerified) {
    return res.json({ success: true, message: 'Account is already verified. Please log in.' });
  }

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const pending = await PendingUserSQL.findOne({ where: { email: normalizedEmail } });
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
  if (!email || !password) {
    return next(new ApiError(400, 'Email and password are required.'));
  }
  const normalizedEmail = String(email).toLowerCase().trim();
  const user = await UserSQL.findOne({ where: { email: normalizedEmail } });
  if (!user || !(await user.comparePassword(password))) {
    return next(new ApiError(401, 'Invalid email or password.'));
  }
  if (user.status === 'suspended') {
    return next(new ApiError(403, 'Your account has been suspended.'));
  }

  setAuthCookie(res, user.id);
  res.json({ success: true, message: 'Logged in successfully.', user: user.toSafeJSON() });
});

const logout = (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Logged out successfully.' });
};

const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token, email, otp } = req.body;

  if (email && otp) {
    const hashedOtp = hashToken(String(otp).trim());
    const user = await UserSQL.findOne({
      where: {
        email: String(email).toLowerCase().trim(),
        verificationOtp: hashedOtp,
        verificationOtpExpires: { [Op.gt]: new Date() },
      },
    });
    if (!user) return next(new ApiError(400, 'Invalid or expired OTP code.'));

    user.emailVerified = true;
    user.verificationOtp = null;
    user.verificationOtpExpires = null;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    setAuthCookie(res, user.id);
    return res.json({ success: true, message: 'Email verified successfully.', user: user.toSafeJSON() });
  }

  if (!token) return next(new ApiError(400, 'Verification token or OTP is required.'));

  const hashed = hashToken(token);
  const user = await UserSQL.findOne({
    where: {
      verificationToken: hashed,
      verificationTokenExpires: { [Op.gt]: new Date() },
    },
  });
  if (!user) return next(new ApiError(400, 'Invalid or expired verification link.'));

  user.emailVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpires = null;
  user.verificationOtp = null;
  user.verificationOtpExpires = null;
  await user.save();

  setAuthCookie(res, user.id);
  res.json({ success: true, message: 'Email verified successfully.', user: user.toSafeJSON() });
});

const resendVerification = asyncHandler(async (req, res, next) => {
  const userId = req.user ? req.user.id : null;
  const user = userId
    ? await UserSQL.findByPk(userId)
    : await UserSQL.findOne({ where: { email: req.body.email } });

  if (!user) return next(new ApiError(404, 'User not found.'));
  if (user.emailVerified) return res.json({ success: true, message: 'Email already verified.' });

  const otp = generateOtp();
  const verificationToken = randomToken(32);
  user.verificationOtp = hashToken(otp);
  user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.verificationToken = hashToken(verificationToken);
  user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
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
  if (!email) {
    return next(new ApiError(400, 'Email address is required.'));
  }
  const normalizedEmail = String(email).toLowerCase().trim();
  const user = await UserSQL.findOne({ where: { email: normalizedEmail } });
  if (!user) {
    return res.status(404).json({ success: false, message: 'No account found with this email address.' });
  }

  const resetToken = randomToken(32);
  const otp = generateOtp();
  user.resetPasswordToken = hashToken(resetToken);
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  user.verificationOtp = hashToken(otp);
  user.verificationOtpExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  try {
    await sendMail({
      to: user.email,
      toName: user.name,
      subject: `Reset your JobHive password - Code: ${otp}`,
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
          <div style="background:#FACC15;padding:20px 28px">
            <span style="font-size:20px;font-weight:800;color:#111827">JobHive</span>
          </div>
          <div style="padding:28px">
            <h2 style="color:#111827;margin:0 0 12px">Reset Your Password</h2>
            <p style="color:#374151;font-size:15px;line-height:1.6">You requested to reset your password. Use the 6-digit code below or click the reset button:</p>
            <div style="margin:24px 0;background:#F9FAFB;border:2px dashed #E5E7EB;border-radius:10px;padding:16px;text-align:center">
              <span style="font-family:monospace;font-size:32px;font-weight:800;letter-spacing:6px;color:#111827">${otp}</span>
              <p style="margin:6px 0 0;color:#6B7280;font-size:12px">Valid for 15 minutes</p>
            </div>
            <div style="margin-top:20px">
              <a href="${getResetUrl(resetToken)}" style="display:inline-block;background:#FACC15;color:#111827;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none">Reset Password via Link</a>
            </div>
          </div>
        </div>
      `,
    });
  } catch (err) {
    logger.error(`[auth] forgotPassword email failed: ${err.message}`);
    return next(new ApiError(500, `Failed to send password reset email: ${err.message}. Please check email service configuration.`));
  }

  res.json({
    success: true,
    message: 'A 6-digit password reset code and link have been sent to your email.',
    email: normalizedEmail,
  });
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const { token, otp, email, password } = req.body;
  if (!password || password.length < 8) {
    return next(new ApiError(400, 'Password must be at least 8 characters.'));
  }

  let user = null;

  // 1. Reset via OTP
  if (email && otp) {
    const normalizedEmail = String(email).toLowerCase().trim();
    const hashedOtp = hashToken(String(otp).trim());
    user = await UserSQL.findOne({
      where: {
        email: normalizedEmail,
        verificationOtp: hashedOtp,
        verificationOtpExpires: { [Op.gt]: new Date() },
      },
    });
  }

  // 2. Reset via Token link
  if (!user && token) {
    const hashed = hashToken(token);
    user = await UserSQL.findOne({
      where: {
        resetPasswordToken: hashed,
        resetPasswordExpires: { [Op.gt]: new Date() },
      },
    });
  }

  if (!user) {
    return next(new ApiError(400, 'Invalid or expired reset code or link. Please request a new code.'));
  }

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  user.verificationOtp = null;
  user.verificationOtpExpires = null;
  await user.save();

  setAuthCookie(res, user.id);
  res.json({ success: true, message: 'Password reset successfully. You are now logged in!', user: user.toSafeJSON() });
});

const me = asyncHandler(async (req, res) => {
  let user = null;
  try {
    user = await UserSQL.findByPk(req.user.id);
  } catch (e) {}
  if (!user && req.user?.email) {
    try {
      user = await UserSQL.findOne({ where: { email: req.user.email } });
    } catch (e) {}
  }
  if (!user) {
    try {
      const UserMongo = require('../models/User');
      user = await UserMongo.findById(req.user.id);
    } catch (e) {}
  }
  if (!user && req.user?.email) {
    try {
      const UserMongo = require('../models/User');
      user = await UserMongo.findOne({ email: req.user.email });
    } catch (e) {}
  }

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Cross-sync avatar if missing in SQL but present in Mongo
  if (!user.avatar && req.user?.email) {
    try {
      const UserMongo = require('../models/User');
      const mUser = await UserMongo.findOne({ email: req.user.email });
      if (mUser?.avatar) {
        user.avatar = mUser.avatar;
      }
    } catch (e) {}
  }

  const safeUser = user.toSafeJSON ? user.toSafeJSON() : (user.toJSON ? user.toJSON() : user);
  res.json({ success: true, user: safeUser });
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

  let user = await UserSQL.findOne({
    where: {
      [Op.or]: [{ googleId }, { email }],
    },
  });

  if (user) {
    if (!user.googleId) user.googleId = googleId;
    if (!user.avatar && picture) user.avatar = picture;
    await user.save();
  } else {
    user = await UserSQL.create({
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

  setAuthCookie(res, user.id);
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
