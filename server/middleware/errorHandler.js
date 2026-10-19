const logger = require('../utils/logger');
const { failure } = require('../utils/apiResponse');

// Centralized error handler (Section 35/41). Any asyncHandler-wrapped
// controller that throws lands here.
function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Server error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value for ${field || 'field'}`;
  }
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired session, please log in again';
  }

  logger.error('request_error', { message, statusCode, path: req.originalUrl, method: req.method });

  return failure(res, {
    message,
    statusCode,
    errors: process.env.NODE_ENV === 'development' ? { stack: err.stack } : null,
  });
}

module.exports = { notFound, errorHandler };
