const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/certificateController');
const { protect, requireRole } = require('../middleware/auth');

// Public verification endpoint - no auth required (Section 22)
router.get('/verify/:certificateId', ctrl.verifyCertificate);

router.use(protect);
router.get('/', ctrl.listCertificates);
router.post('/generate', requireRole('student'), ctrl.generateCertificate);
router.get('/:id', ctrl.getCertificate);
router.put('/:id/approve', requireRole('admin'), ctrl.approveCertificate);

module.exports = router;
