const { Progress, Enrollment } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { success, failure } = require('../utils/apiResponse');
const { upsertLessonProgress } = require('../services/progressService');

// GET /api/progress/:courseId
const getCourseProgress = asyncHandler(async (req, res) => {
  const progress = await Progress.findOne({ student: req.user._id, course: req.params.courseId });
  if (!progress) return failure(res, { message: 'No progress found for this course', statusCode: 404 });
  return success(res, { data: { progress } });
});

// POST /api/progress/lesson  body: { lessonId, completed }
// Marks a non-video lesson (e.g. tutorial-only) complete directly.
const markLessonComplete = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.body;

  const enrollment = await Enrollment.findOne({ student: req.user._id, course: courseId, status: 'approved' });
  if (!enrollment) return failure(res, { message: 'Not enrolled in this course', statusCode: 403 });

  const progress = await upsertLessonProgress(req.user._id, courseId, lessonId, {
    videoProgressPercent: 100,
    threshold: 0,
  });

  return success(res, { message: 'Lesson marked complete', data: { progress } });
});

// POST /api/progress/video  body: { courseId, lessonId, videoProgressPercent, threshold }
const updateVideoProgress = asyncHandler(async (req, res) => {
  const { courseId, lessonId, videoProgressPercent, threshold } = req.body;

  const enrollment = await Enrollment.findOne({ student: req.user._id, course: courseId, status: 'approved' });
  if (!enrollment) return failure(res, { message: 'Not enrolled in this course', statusCode: 403 });

  const progress = await upsertLessonProgress(req.user._id, courseId, lessonId, {
    videoProgressPercent: videoProgressPercent || 0,
    threshold: threshold || 90,
  });

  return success(res, { message: 'Progress updated', data: { progress } });
});

module.exports = { getCourseProgress, markLessonComplete, updateVideoProgress };
