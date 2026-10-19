const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema(
  {
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    videoProgressPercent: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);

const progressSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lessons: [lessonProgressSchema],
    overallCompletionPercent: { type: Number, default: 0 },
    lastAccessedLesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null },
    finalAssessmentPassed: { type: Boolean, default: false },
    averageQuizScorePercent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

progressSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
