const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const pendingUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['candidate', 'recruiter'],
      default: 'candidate',
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 900 }, // Documents auto-deleted after 15 minutes
    },
  },
  { timestamps: true }
);

pendingUserSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password') || !this.password) return;
  if (
    typeof this.password === 'string' &&
    (this.password.startsWith('$2a$') || this.password.startsWith('$2b$') || this.password.startsWith('$2y$') || this.password.startsWith('$2x$')) &&
    this.password.length === 60
  ) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const PendingUser = mongoose.model('PendingUser', pendingUserSchema);
module.exports = PendingUser;
