const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/proctorController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);

router.post('/start', requireRole('student'), ctrl.startSession);
router.post('/event', requireRole('student'), ctrl.logEvent);
router.post('/end', ctrl.endSession);
router.get('/sessions', requireRole('admin'), ctrl.listSessions);
router.get('/session/:id', ctrl.getSession);

module.exports = router;
