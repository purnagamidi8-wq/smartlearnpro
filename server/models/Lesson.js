const mongoose = require('mongoose');

// Structured tutorial content blocks (Section 10)
const contentBlockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['heading', 'paragraph', 'code', 'image', 'list', 'table', 'note', 'example', 'summary'],
      required: true,
    },
    // Generic payload - shape depends on `type`; kept flexible on purpose.
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const resourceSchema = new mongoose.Schema(
  {
    title: String,
    url: String,
    fileType: String,
  },
  { _id: false }
);

const lessonSchema = new mongoose.Schema(
  {
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },

    // Video metadata only - actual file lives in cloud storage (Section 9)
    video: {
      url: { type: String, default: null },
      provider: { type: String, enum: ['cloudinary', 's3', 'none'], default: 'none' },
      publicId: { type: String, default: null },
      durationSeconds: { type: Number, default: 0 },
      completionThresholdPercent: { type: Number, default: 90 },
    },

    tutorialContent: [contentBlockSchema],
    resources: [resourceSchema],

    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lesson', lessonSchema);
