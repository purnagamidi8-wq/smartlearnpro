const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
    lessonOrder: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Module', moduleSchema);
