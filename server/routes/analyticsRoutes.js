const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/analyticsController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect, requireRole('admin'));
router.get('/admin-dashboard', ctrl.adminDashboard);

module.exports = router;
