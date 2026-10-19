const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    selectedIndex: { type: Number, default: null },
    isCorrect: { type: Boolean, default: false },
    marksAwarded: { type: Number, default: 0 },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    answers: [answerSchema],
    totalMarks: { type: Number, default: 0 },
    marksObtained: { type: Number, default: 0 },
    scorePercent: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: null },
    attemptNumber: { type: Number, required: true },
    // Only set when the quiz is a proctored final assessment
    proctorSession: { type: mongoose.Schema.Types.ObjectId, ref: 'ProctorSession', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
