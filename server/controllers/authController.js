const validator = require('validator');
const { User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { success, failure } = require('../utils/apiResponse');
const { hashPassword, comparePassword, signToken, cookieOptions } = require('../services/authService');
const { generateToken, hashToken } = require('../utils/tokens');
const { sendEmail, templates } = require('../services/emailService');

const COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'slp_token';

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return failure(res, { message: 'All fields are required', statusCode: 400 });
  }
  if (!validator.isEmail(email)) {
    return failure(res, { message: 'Invalid email address', statusCode: 400 });
  }
  if (password.length < 8) {
    return failure(res, { message: 'Password must be at least 8 characters', statusCode: 400 });
  }
  if (password !== confirmPassword) {
    return failure(res, { message: 'Passwords do not match', statusCode: 400 });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return failure(res, { message: 'An account with this email already exists', statusCode: 409 });
  }

  const passwordHash = await hashPassword(password);
  const { raw, hash } = generateToken();

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: 'student',
    emailVerificationTokenHash: hash,
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${raw}`;
  await sendEmail({ to: user.email, ...templates.registrationConfirmation(user) });
  await sendEmail({ to: user.email, ...templates.verifyEmail(user, verifyUrl) });

  return success(res, {
    message: 'Registration successful. Please check your email to verify your account.',
    statusCode: 201,
    data: { id: user._id, email: user.email },
  });
});

// GET /api/auth/verify-email/:token
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const hash = hashToken(token);

  const user = await User.findOne({
    emailVerificationTokenHash: hash,
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) {
    return failure(res, { message: 'Verification link is invalid or has expired', statusCode: 400 });
  }

  user.isEmailVerified = true;
  user.emailVerificationTokenHash = null;
  user.emailVerificationExpires = null;
  await user.save();

  return success(res, { message: 'Email verified successfully. You can now log in.' });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return failure(res, { message: 'Email and password are required', statusCode: 400 });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    return failure(res, { message: 'Invalid email or password', statusCode: 401 });
  }
  if (!user.isActive) {
    return failure(res, { message: 'Account is deactivated', statusCode: 403 });
  }
  if (!user.isEmailVerified) {
    return failure(res, { message: 'Please verify your email before logging in', statusCode: 403 });
  }

  const token = signToken(user);
  res.cookie(COOKIE_NAME, token, cookieOptions());

  return success(res, {
    message: 'Login successful',
    data: {
      token, // also returned in body for non-cookie API clients
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    },
  });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.clearCookie(COOKIE_NAME);
  return success(res, { message: 'Logged out' });
});

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });

  // Always respond the same way to avoid leaking which emails are registered.
  const genericMessage = 'If an account with that email exists, a reset link has been sent.';
  if (!user) return success(res, { message: genericMessage });

  const { raw, hash } = generateToken();
  user.passwordResetTokenHash = hash;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${raw}`;
  await sendEmail({ to: user.email, ...templates.passwordReset(user, resetUrl) });

  return success(res, { message: genericMessage });
});

// POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password, confirmPassword } = req.body;
  if (!token || !password || !confirmPassword) {
    return failure(res, { message: 'All fields are required', statusCode: 400 });
  }
  if (password !== confirmPassword) {
    return failure(res, { message: 'Passwords do not match', statusCode: 400 });
  }
  if (password.length < 8) {
    return failure(res, { message: 'Password must be at least 8 characters', statusCode: 400 });
  }

  const hash = hashToken(token);
  const user = await User.findOne({
    passwordResetTokenHash: hash,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    return failure(res, { message: 'Reset link is invalid or has expired', statusCode: 400 });
  }

  user.passwordHash = await hashPassword(password);
  user.passwordResetTokenHash = null;
  user.passwordResetExpires = null;
  await user.save();

  return success(res, { message: 'Password reset successful. You can now log in.' });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  return success(res, { data: { user: req.user } });
});

module.exports = { register, verifyEmail, login, logout, forgotPassword, resetPassword, getMe };
