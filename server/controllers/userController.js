const { User, Enrollment, Progress, Certificate } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { success, failure } = require('../utils/apiResponse');

// GET /api/users (admin) - manage students
const listUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 });
  return success(res, { data: { users } });
});

// PUT /api/users/:id/status (admin) - activate/deactivate
const setUserActive = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: req.body.isActive },
    { new: true }
  ).select('-passwordHash');
  if (!user) return failure(res, { message: 'User not found', statusCode: 404 });
  return success(res, { message: 'User status updated', data: { user } });
});

// GET /api/users/dashboard-stats (student's own dashboard summary - Section 23)
const studentDashboardStats = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id }).populate('course', 'title thumbnailUrl');
  const approved = enrollments.filter((e) => e.status === 'approved');

  const progresses = await Progress.find({ student: req.user._id, course: { $in: approved.map((e) => e.course._id) } });
  const completed = progresses.filter((p) => p.overallCompletionPercent >= 100).length;
  const avgProgress = progresses.length
    ? Math.round(progresses.reduce((s, p) => s + p.overallCompletionPercent, 0) / progresses.length)
    : 0;
  const avgQuizScore = progresses.length
    ? Math.round(progresses.reduce((s, p) => s + p.averageQuizScorePercent, 0) / progresses.length)
    : 0;

  const certificates = await Certificate.find({ student: req.user._id }).populate('course', 'title');

  return success(res, {
    data: {
      totalEnrolled: enrollments.length,
      activeCourses: approved.length - completed,
      completedCourses: completed,
      overallProgressPercent: avgProgress,
      averageQuizScorePercent: avgQuizScore,
      certificatesCount: certificates.length,
      enrollments,
      certificates,
    },
  });
});

module.exports = { listUsers, setUserActive, studentDashboardStats };
