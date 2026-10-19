const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { failure } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Verifies the JWT (from HTTP-only cookie, falling back to Authorization
// header for API clients/tests) and attaches the authenticated user.
const protect = asyncHandler(async (req, res, next) => {
  let token = null;
  const cookieName = process.env.JWT_COOKIE_NAME || 'slp_token';

  if (req.cookies && req.cookies[cookieName]) {
    token = req.cookies[cookieName];
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return failure(res, { message: 'Not authenticated', statusCode: 401 });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-passwordHash');

  if (!user || !user.isActive) {
    return failure(res, { message: 'Account not found or deactivated', statusCode: 401 });
  }

  req.user = user;
  next();
});

// Section 3: the backend must independently re-verify role on every
// admin-only route. Never trust a role claim purely from the frontend.
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return failure(res, { message: 'Forbidden: insufficient permissions', statusCode: 403 });
    }
    next();
  };
}

module.exports = { protect, requireRole };
