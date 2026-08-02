const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const signToken = (userId) =>
  jwt.sign({ id: userId }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });

const setAuthCookie = (res, userId) => {
  const token = signToken(userId);
  const isProd = env.isProd;
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  res.cookie('token', token, {
    expires,
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
  return token;
};

const clearAuthCookie = (res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'none' : 'lax',
    path: '/',
  });
};

const protect = async (req, res, next) => {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) throw new ApiError(401, 'Not authenticated. Please login.');

    const decoded = jwt.verify(token, env.jwt.secret);
    const user = await User.findById(decoded.id);
    if (!user) throw new ApiError(401, 'Account no longer exists.');

    if (user.status === 'suspended') {
      throw new ApiError(403, 'Your account has been suspended.');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

const optionalProtect = async (req, res, next) => {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) return next();
    const decoded = jwt.verify(token, env.jwt.secret);
    const user = await User.findById(decoded.id);
    if (user && user.status !== 'suspended') req.user = user;
    next();
  } catch {
    next();
  }
};

const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action.'));
    }
    next();
  };

module.exports = { protect, optionalProtect, authorize, signToken, setAuthCookie, clearAuthCookie };
