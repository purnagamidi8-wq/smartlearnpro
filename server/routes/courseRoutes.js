const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/courseController');
const { protect, requireRole } = require('../middleware/auth');

// Public/optional-auth listing (published only unless admin)
router.get('/', (req, res, next) => {
  // optional auth: attach user if a token is present, else continue as guest
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies && req.cookies[process.env.JWT_COOKIE_NAME || 'slp_token'];
  if (authHeader || cookieToken) return protect(req, res, next);
  next();
}, ctrl.listCourses);

router.get('/:id', protect, ctrl.getCourse);
router.get('/lessons/:lessonId', protect, ctrl.getLesson);

router.post('/', protect, requireRole('admin'), ctrl.createCourse);
router.put('/:id', protect, requireRole('admin'), ctrl.updateCourse);
router.delete('/:id', protect, requireRole('admin'), ctrl.deleteCourse);

router.post('/:id/modules', protect, requireRole('admin'), ctrl.addModule);
router.put('/:id/modules/reorder', protect, requireRole('admin'), ctrl.reorderModules);
router.post('/modules/:moduleId/lessons', protect, requireRole('admin'), ctrl.addLesson);
router.put('/modules/:moduleId/lessons/reorder', protect, requireRole('admin'), ctrl.reorderLessons);

module.exports = router;
