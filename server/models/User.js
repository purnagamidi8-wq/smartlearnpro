const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },

    isEmailVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String, default: null },
    emailVerificationExpires: { type: Date, default: null },

    passwordResetTokenHash: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },

    isActive: { type: Boolean, default: true },
    avatarUrl: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
