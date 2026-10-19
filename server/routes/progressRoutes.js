const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/progressController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect, requireRole('student'));

router.get('/:courseId', ctrl.getCourseProgress);
router.post('/lesson', ctrl.markLessonComplete);
router.post('/video', ctrl.updateVideoProgress);

module.exports = router;
