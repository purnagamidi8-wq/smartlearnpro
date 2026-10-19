const mongoose = require('mongoose');

// question_type is kept as a discriminator-style string so more types
// (true/false, short-answer, matching...) can be added later without a
// schema migration.
const questionSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    questionText: { type: String, required: true },
    questionType: { type: String, enum: ['mcq'], default: 'mcq' },
    options: [{ type: String }],
    correctAnswerIndex: { type: Number, required: true },
    marks: { type: Number, default: 1 },
    explanation: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
