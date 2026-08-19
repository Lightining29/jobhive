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

const UserSQL = require('../models/sql/User.sql');

const authUserCache = new Map();
const AUTH_USER_CACHE_TTL = 30 * 1000; // 30 seconds in-memory cache

const invalidateUserCache = (id) => {
  if (id) {
    authUserCache.delete(String(id));
  }
};

const findUserById = async (id) => {
  const cacheKey = String(id);
  const now = Date.now();
  const cached = authUserCache.get(cacheKey);
  if (cached && now < cached.expiresAt) {
    return cached.user;
  }

  let user = null;
  let mongoUser = null;

  try {
    const sqlUser = await UserSQL.findByPk(id);
    if (sqlUser) user = sqlUser;
  } catch (err) {}

  if (!user) {
    try {
      if (User.findById) {
        user = await User.findById(id);
      }
    } catch (err) {}
    if (!user && User.findOne) {
      try {
        user = await User.findOne({ $or: [{ email: id }, { _id: id }] });
      } catch (err) {}
    }
  }

  // Cross sync between SQL and Mongo
  if (user) {
    const email = user.email;
    if (email) {
      try {
        if (User.findOne) {
          mongoUser = await User.findOne({ email });
          if (!mongoUser && User.create) {
            mongoUser = await User.create({
              name: user.name || 'User',
              email: user.email,
              password: user.password || 'synced_account',
              role: user.role || 'candidate',
              emailVerified: true,
              status: user.status || 'active',
              avatar: user.avatar || '',
              headline: user.headline || '',
              bio: user.bio || '',
              skills: user.skills || [],
            });
          }
        }
      } catch (e) {}
    }

    if (mongoUser) {
      user._id = mongoUser._id;
      user.mongoId = mongoUser._id;
    } else if (!user._id) {
      user._id = user.id;
    }

    if (authUserCache.size > 5000) {
      const firstKey = authUserCache.keys().next().value;
      authUserCache.delete(firstKey);
    }
    authUserCache.set(cacheKey, { user, expiresAt: now + AUTH_USER_CACHE_TTL });
  }

  return user;
};

const protect = async (req, res, next) => {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) throw new ApiError(401, 'Not authenticated. Please login.');

    const decoded = jwt.verify(token, env.jwt.secret);
    const user = await findUserById(decoded.id);
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
    const user = await findUserById(decoded.id);
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

module.exports = { protect, optionalProtect, authorize, signToken, setAuthCookie, clearAuthCookie, invalidateUserCache };
