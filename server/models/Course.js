const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    thumbnailUrl: { type: String, default: null },
    category: { type: String, default: 'General' },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    instructor: { type: String, default: 'SmartLearn Pro Staff' },
    durationHours: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    requiresApproval: { type: Boolean, default: true },
    learningObjectives: [{ type: String }],
    prerequisites: [{ type: String }],

    // Certificate eligibility rules for this course (Section 40)
    completionRequirements: {
      minCompletionPercent: { type: Number, default: 100 },
      minQuizScorePercent: { type: Number, default: 60 },
      requireFinalAssessmentPass: { type: Boolean, default: true },
    },

    moduleOrder: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

courseSchema.index({ status: 1, category: 1 });

module.exports = mongoose.model('Course', courseSchema);
