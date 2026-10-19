const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiters');

router.post('/register', authLimiter, ctrl.register);
router.get('/verify-email/:token', ctrl.verifyEmail);
router.post('/login', authLimiter, ctrl.login);
router.post('/logout', ctrl.logout);
router.post('/forgot-password', authLimiter, ctrl.forgotPassword);
router.post('/reset-password', authLimiter, ctrl.resetPassword);
router.get('/me', protect, ctrl.getMe);

module.exports = router;
