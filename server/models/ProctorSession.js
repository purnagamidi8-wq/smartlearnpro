const mongoose = require('mongoose');

const proctorSessionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    status: { type: String, enum: ['in_progress', 'completed', 'terminated'], default: 'in_progress' },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },

    cameraGranted: { type: Boolean, default: false },
    micGranted: { type: Boolean, default: false },

    // Academic score lives on QuizAttempt. This is ONLY the integrity signal (Section 19).
    riskScore: { type: Number, default: 0 },
    riskLevel: { type: String, enum: ['NORMAL', 'WARNING', 'HIGH_RISK', 'CRITICAL'], default: 'NORMAL' },
    eventCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProctorSession', proctorSessionSchema);
