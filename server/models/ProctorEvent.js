const mongoose = require('mongoose');

const proctorEventSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'ProctorSession', required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventType: {
      type: String,
      enum: [
        'FACE_NOT_DETECTED',
        'MULTIPLE_FACES',
        'FACE_DEVIATION',
        'FACE_RETURNED',
        'AUDIO_ANOMALY',
        'TAB_SWITCH',
        'FULLSCREEN_EXIT',
      ],
      required: true,
    },
    // Neutral label shown to admins - never asserts guilt (Section 15/48)
    label: { type: String, default: 'Potential Integrity Event' },
    severityWeight: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProctorEvent', proctorEventSchema);
