const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (err.name === 'CastError') {
    error = new ApiError(400, 'Invalid resource id');
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = new ApiError(409, `${field} already exists`);
  } else if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(400, messages.join(', '));
  } else if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token, please login again');
  } else if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token expired, please login again');
  } else if (err.name === 'MulterError') {
    error = new ApiError(400, `Upload error: ${err.message}`);
  }

  if (!(error instanceof ApiError)) {
    logger.error('Unhandled error', { message: error.message, stack: error.stack });
    error = new ApiError(500, 'Internal server error');
  }

  if (error.statusCode >= 500) logger.error(error.message);

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    details: error.details || undefined,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
};

module.exports = { notFound, errorHandler };
