const { Progress, Lesson } = require('../models');

// Recomputes overallCompletionPercent from scratch so it never drifts out of
// sync with the underlying lesson-completion records (Section 39).
async function recalcCourseCompletion(studentId, courseId) {
  const progress = await Progress.findOne({ student: studentId, course: courseId });
  if (!progress) return null;

  const totalLessons = await Lesson.countDocuments({ course: courseId });
  if (totalLessons === 0) {
    progress.overallCompletionPercent = 0;
  } else {
    const completedCount = progress.lessons.filter((l) => l.completed).length;
    progress.overallCompletionPercent = Math.round((completedCount / totalLessons) * 100);
  }

  await progress.save();
  return progress;
}

async function upsertLessonProgress(studentId, courseId, lessonId, { videoProgressPercent, threshold }) {
  let progress = await Progress.findOne({ student: studentId, course: courseId });
  if (!progress) {
    progress = await Progress.create({ student: studentId, course: courseId, lessons: [] });
  }

  let entry = progress.lessons.find((l) => String(l.lesson) === String(lessonId));
  if (!entry) {
    entry = { lesson: lessonId, videoProgressPercent: 0, completed: false };
    progress.lessons.push(entry);
  }

  entry.videoProgressPercent = Math.max(entry.videoProgressPercent, videoProgressPercent);
  if (!entry.completed && entry.videoProgressPercent >= (threshold || 90)) {
    entry.completed = true;
    entry.completedAt = new Date();
  }

  progress.lastAccessedLesson = lessonId;
  await progress.save();

  return recalcCourseCompletion(studentId, courseId);
}

module.exports = { recalcCourseCompletion, upsertLessonProgress };
