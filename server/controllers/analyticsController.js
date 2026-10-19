const { User, Course, Enrollment, Certificate, QuizAttempt, ProctorSession, Progress } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

// GET /api/analytics/admin-dashboard (Section 24)
const adminDashboard = asyncHandler(async (req, res) => {
  const [
    totalStudents,
    activeStudents,
    totalCourses,
    totalEnrollments,
    pendingEnrollments,
    certificatesIssued,
    activeProctorSessions,
    highRiskSessions,
    allAttempts,
    allProgress,
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'student', isActive: true }),
    Course.countDocuments(),
    Enrollment.countDocuments(),
    Enrollment.countDocuments({ status: 'pending' }),
    Certificate.countDocuments({ status: 'issued' }),
    ProctorSession.countDocuments({ status: 'in_progress' }),
    ProctorSession.countDocuments({ riskLevel: { $in: ['HIGH_RISK', 'CRITICAL'] } }),
    QuizAttempt.find().select('scorePercent'),
    Progress.find().select('overallCompletionPercent'),
  ]);

  const averageQuizScorePercent = allAttempts.length
    ? Math.round(allAttempts.reduce((s, a) => s + a.scorePercent, 0) / allAttempts.length)
    : 0;
  const courseCompletionRate = allProgress.length
    ? Math.round((allProgress.filter((p) => p.overallCompletionPercent >= 100).length / allProgress.length) * 100)
    : 0;

  // Simple enrollment-over-time series for the chart (last 6 months)
  const now = new Date();
  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const enrollmentTrend = await Promise.all(
    months.map(async ({ year, month }) => {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 1);
      const count = await Enrollment.countDocuments({ createdAt: { $gte: start, $lt: end } });
      return { label: start.toLocaleString('default', { month: 'short' }), count };
    })
  );

  return success(res, {
    data: {
      totalStudents,
      activeStudents,
      totalCourses,
      totalEnrollments,
      pendingEnrollments,
      courseCompletionRate,
      averageQuizScorePercent,
      certificatesIssued,
      activeProctorSessions,
      highRiskSessions,
      enrollmentTrend,
    },
  });
});

module.exports = { adminDashboard };
