const { Enrollment, Course, User, Progress } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { success, failure } = require('../utils/apiResponse');
const { sendEmail, templates } = require('../services/emailService');
const { notify, notifyAllAdmins } = require('../services/notificationService');

// POST /api/enrollments  (student requests enrollment)
const requestEnrollment = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const course = await Course.findById(courseId);
  if (!course) return failure(res, { message: 'Course not found', statusCode: 404 });

  const existing = await Enrollment.findOne({ student: req.user._id, course: courseId });
  if (existing) {
    return failure(res, { message: `Enrollment already ${existing.status}`, statusCode: 409 });
  }

  // If the course does not require approval, auto-approve.
  const status = course.requiresApproval ? 'pending' : 'approved';
  const enrollment = await Enrollment.create({ student: req.user._id, course: courseId, status });

  if (status === 'approved') {
    await Progress.create({ student: req.user._id, course: courseId, lessons: [] });
    await notify(req.user._id, {
      type: 'ENROLLMENT_APPROVED',
      title: 'Enrollment approved',
      message: `You're enrolled in ${course.title}. Start learning now!`,
      link: `/courses/${course._id}`,
    });
  } else {
    await notifyAllAdmins(User, {
      type: 'ENROLLMENT_REQUEST',
      title: 'New enrollment request',
      message: `${req.user.name} requested enrollment in ${course.title}`,
      link: `/admin/enrollments`,
    });
    const admins = await User.find({ role: 'admin' }).select('name email');
    await Promise.all(
      admins.map((admin) =>
        sendEmail({ to: admin.email, ...templates.enrollmentRequested(admin.name, req.user.name, course.title) })
      )
    );
  }

  return success(res, {
    message: status === 'approved' ? 'Enrolled successfully' : 'Enrollment request submitted, pending admin approval',
    statusCode: 201,
    data: { enrollment },
  });
});

// GET /api/enrollments  (admin: all / student: own)
const listEnrollments = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { student: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const enrollments = await Enrollment.find(filter)
    .populate('student', 'name email')
    .populate('course', 'title thumbnailUrl')
    .sort({ createdAt: -1 });

  return success(res, { data: { enrollments } });
});

// PUT /api/enrollments/:id/approve (admin)
const approveEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id).populate('course').populate('student');
  if (!enrollment) return failure(res, { message: 'Enrollment not found', statusCode: 404 });
  if (enrollment.status !== 'pending') {
    return failure(res, { message: `Enrollment already ${enrollment.status}`, statusCode: 409 });
  }

  enrollment.status = 'approved';
  enrollment.decidedAt = new Date();
  enrollment.decidedBy = req.user._id;
  await enrollment.save();

  await Progress.findOneAndUpdate(
    { student: enrollment.student._id, course: enrollment.course._id },
    { $setOnInsert: { lessons: [] } },
    { upsert: true }
  );

  await notify(enrollment.student._id, {
    type: 'ENROLLMENT_APPROVED',
    title: 'Enrollment approved',
    message: `You're enrolled in ${enrollment.course.title}. Start learning now!`,
    link: `/courses/${enrollment.course._id}`,
  });
  await sendEmail({
    to: enrollment.student.email,
    ...templates.enrollmentApproved(enrollment.student, enrollment.course.title, `${process.env.CLIENT_URL}/courses/${enrollment.course._id}`),
  });

  return success(res, { message: 'Enrollment approved', data: { enrollment } });
});

// PUT /api/enrollments/:id/reject (admin)
const rejectEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id).populate('course').populate('student');
  if (!enrollment) return failure(res, { message: 'Enrollment not found', statusCode: 404 });
  if (enrollment.status !== 'pending') {
    return failure(res, { message: `Enrollment already ${enrollment.status}`, statusCode: 409 });
  }

  enrollment.status = 'rejected';
  enrollment.decidedAt = new Date();
  enrollment.decidedBy = req.user._id;
  enrollment.rejectionReason = req.body.reason || null;
  await enrollment.save();

  await notify(enrollment.student._id, {
    type: 'ENROLLMENT_REJECTED',
    title: 'Enrollment update',
    message: `Your request for ${enrollment.course.title} was not approved.`,
  });
  await sendEmail({
    to: enrollment.student.email,
    ...templates.enrollmentRejected(enrollment.student, enrollment.course.title, enrollment.rejectionReason),
  });

  return success(res, { message: 'Enrollment rejected', data: { enrollment } });
});

module.exports = { requestEnrollment, listEnrollments, approveEnrollment, rejectEnrollment };
