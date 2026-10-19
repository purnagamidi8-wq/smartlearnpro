const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard-stats', requireRole('student'), ctrl.studentDashboardStats);
router.get('/', requireRole('admin'), ctrl.listUsers);
router.put('/:id/status', requireRole('admin'), ctrl.setUserActive);

module.exports = router;
