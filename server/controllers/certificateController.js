const path = require('path');
const { Certificate, Progress, Course, QuizAttempt, Quiz } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { success, failure } = require('../utils/apiResponse');
const {
  generateCertificateId,
  meetsCompletionRequirements,
  generateCertificatePdf,
} = require('../services/certificateService');
const { sendEmail, templates } = require('../services/emailService');
const { notify } = require('../services/notificationService');

// POST /api/certificates/generate  body: { courseId }
const generateCertificate = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  const course = await Course.findById(courseId);
  if (!course) return failure(res, { message: 'Course not found', statusCode: 404 });

  const progress = await Progress.findOne({ student: req.user._id, course: courseId });
  if (!progress) return failure(res, { message: 'No progress recorded for this course', statusCode: 404 });

  const finalQuiz = await Quiz.findOne({ course: courseId, isFinalAssessment: true });
  const finalAttempt = finalQuiz
    ? await QuizAttempt.findOne({ quiz: finalQuiz._id, student: req.user._id, passed: true }).sort({ createdAt: -1 })
    : null;

  const eligible = meetsCompletionRequirements(course, progress, finalAttempt);
  if (!eligible) {
    return failure(res, { message: 'Course completion requirements not yet satisfied', statusCode: 400 });
  }

  const existing = await Certificate.findOne({ student: req.user._id, course: courseId });
  if (existing) {
    return success(res, { message: 'Certificate already exists', data: { certificate: existing } });
  }

  const certificateId = await generateCertificateId();
  const finalScorePercent = finalAttempt ? finalAttempt.scorePercent : progress.averageQuizScorePercent;

  // Requires admin review before issuance if the course is configured that way;
  // otherwise auto-issue the PDF immediately.
  const requiresReview = course.completionRequirements.requireFinalAssessmentPass === true && course.requiresApproval === true;
  const status = requiresReview ? 'pending_review' : 'approved';

  let certificate = await Certificate.create({
    certificateId,
    student: req.user._id,
    course: courseId,
    finalScorePercent,
    status,
  });

  if (status === 'approved') {
    certificate = await issueCertificateInternal(certificate, course, req.user);
  }

  await notify(req.user._id, {
    type: 'CERTIFICATE_AVAILABLE',
    title: status === 'approved' ? 'Certificate ready' : 'Certificate pending review',
    message:
      status === 'approved'
        ? `Your certificate for ${course.title} is ready.`
        : `Your certificate for ${course.title} is awaiting admin approval.`,
    link: `/certificates`,
  });

  return success(res, { message: 'Certificate processed', statusCode: 201, data: { certificate } });
});

async function issueCertificateInternal(certificate, course, student) {
  const pdfUrl = await generateCertificatePdf({
    certificateId: certificate.certificateId,
    studentName: student.name,
    courseTitle: course.title,
    completionDate: new Date().toLocaleDateString(),
    finalScorePercent: certificate.finalScorePercent,
  });

  certificate.status = 'issued';
  certificate.issuedAt = new Date();
  certificate.pdfUrl = pdfUrl;
  await certificate.save();

  await sendEmail({
    to: student.email,
    ...templates.certificateAvailable(student, course.title, `${process.env.CLIENT_URL}/certificates`),
  });

  return certificate;
}

// PUT /api/certificates/:id/approve (admin)
const approveCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id).populate('student').populate('course');
  if (!certificate) return failure(res, { message: 'Certificate not found', statusCode: 404 });
  if (certificate.status === 'issued') {
    return failure(res, { message: 'Certificate already issued', statusCode: 409 });
  }

  certificate.approvedBy = req.user._id;
  certificate.status = 'approved';
  await certificate.save();

  const issued = await issueCertificateInternal(certificate, certificate.course, certificate.student);

  return success(res, { message: 'Certificate approved and issued', data: { certificate: issued } });
});

// GET /api/certificates  (student's own, or all for admin)
const listCertificates = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { student: req.user._id };
  const certificates = await Certificate.find(filter)
    .populate('student', 'name email')
    .populate('course', 'title')
    .sort({ createdAt: -1 });
  return success(res, { data: { certificates } });
});

// GET /api/certificates/:id
const getCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id).populate('course', 'title').populate('student', 'name');
  if (!certificate) return failure(res, { message: 'Certificate not found', statusCode: 404 });
  return success(res, { data: { certificate } });
});

// GET /api/certificates/verify/:certificateId  (public)
const verifyCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({ certificateId: req.params.certificateId, status: 'issued' })
    .populate('student', 'name')
    .populate('course', 'title');

  if (!certificate) {
    return failure(res, { message: 'Certificate not found or not yet issued', statusCode: 404 });
  }

  return success(res, {
    data: {
      valid: true,
      certificateId: certificate.certificateId,
      studentName: certificate.student.name,
      courseTitle: certificate.course.title,
      finalScorePercent: certificate.finalScorePercent,
      issuedAt: certificate.issuedAt,
    },
  });
});

module.exports = { generateCertificate, approveCertificate, listCertificates, getCertificate, verifyCertificate };
