const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/quizController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);

router.post('/', requireRole('admin'), ctrl.createQuiz);
router.get('/:id', ctrl.getQuiz);
router.post('/:id/submit', requireRole('student'), ctrl.submitQuiz);
router.get('/:id/results', ctrl.getQuizResults);

module.exports = router;
