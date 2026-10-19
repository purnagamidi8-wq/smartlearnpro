const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/courses', require('./courseRoutes'));
router.use('/enrollments', require('./enrollmentRoutes'));
router.use('/progress', require('./progressRoutes'));
router.use('/quizzes', require('./quizRoutes'));
router.use('/proctor', require('./proctorRoutes'));
router.use('/certificates', require('./certificateRoutes'));
router.use('/notifications', require('./notificationRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/analytics', require('./analyticsRoutes'));

module.exports = router;
