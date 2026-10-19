const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', default: null },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null },
    isFinalAssessment: { type: Boolean, default: false },
    isProctored: { type: Boolean, default: false },
    timeLimitMinutes: { type: Number, default: 30 },
    passingScorePercent: { type: Number, default: 60 },
    maxAttempts: { type: Number, default: 3 },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
