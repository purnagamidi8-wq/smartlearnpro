const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    certificateId: { type: String, required: true, unique: true }, // e.g. SLP-2026-000001
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    finalScorePercent: { type: Number, required: true },
    status: { type: String, enum: ['eligible', 'pending_review', 'approved', 'issued'], default: 'eligible' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    issuedAt: { type: Date, default: null },
    pdfUrl: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certificate', certificateSchema);
