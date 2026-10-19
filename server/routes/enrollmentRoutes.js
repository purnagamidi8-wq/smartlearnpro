const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/enrollmentController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);

router.post('/', requireRole('student'), ctrl.requestEnrollment);
router.get('/', ctrl.listEnrollments);
router.put('/:id/approve', requireRole('admin'), ctrl.approveEnrollment);
router.put('/:id/reject', requireRole('admin'), ctrl.rejectEnrollment);

module.exports = router;
