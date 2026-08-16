const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const socialLinksSchema = new mongoose.Schema(
  {
    linkedin: String,
    github: String,
    portfolio: String,
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, trim: true },
    degree: { type: String, trim: true },
    fieldOfStudy: { type: String, trim: true },
    startYear: Number,
    endYear: Number,
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    role: { type: String, trim: true },
    company: { type: String, trim: true },
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    description: { type: String, trim: true },
  },
  { _id: false }
);

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    issuer: { type: String, trim: true },
    year: Number,
    link: String,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
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
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    googleId: { type: String, unique: true, sparse: true },
    role: {
      type: String,
      enum: ['candidate', 'recruiter', 'admin'],
      default: 'candidate',
      index: true,
    },
    phone: { type: String, trim: true },
    headline: { type: String, trim: true, maxlength: 160 },
    bio: { type: String, trim: true, maxlength: 1000 },

    avatar: { type: String },
    resume: {
      url: { type: String },
      publicId: { type: String },
      originalName: { type: String },
      uploadedAt: { type: Date },
    },

    skills: [{ type: String, trim: true, lowercase: true }],
    education: [educationSchema],
    experience: [experienceSchema],
    certifications: [certificationSchema],
    socialLinks: socialLinksSchema,

    preferences: {
      preferredLocations: { type: [String], default: [] },
      preferredSalary: Number,
      preferredSalaryCurrency: { type: String, default: 'USD' },
      preferredWorkMode: {
        type: String,
        enum: ['remote', 'hybrid', 'onsite', ''],
        default: '',
      },
      preferredEmploymentType: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'internship', ''],
        default: '',
      },
      preferredCategory: { type: String, enum: ['technical', 'non-technical', ''], default: '' },
      preferredJobTitle: { type: String, trim: true, default: '' },
    },

    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

    emailVerified: { type: Boolean, default: false },
    verificationOtp: String,
    verificationOtpExpires: Date,
    verificationToken: String,
    verificationTokenExpires: Date,

    resetPasswordToken: String,
    resetPasswordExpires: Date,

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },

    // Admin Role & Custom Permissions
    adminRole: {
      type: String,
      enum: ['super_admin', 'finance_admin', 'job_moderator', 'support_admin', 'marketing_admin', 'staff', ''],
      default: '',
    },
    permissions: [{ type: String, trim: true }],

    // User Quota / Credits Balance
    credits: {
      jobPosts: { type: Number, default: 3 },
      featuredJobs: { type: Number, default: 0 },
      urgentJobs: { type: Number, default: 0 },
      profileViews: { type: Number, default: 10 },
      resumeDownloads: { type: Number, default: 5 },
      contactCredits: { type: Number, default: 5 },
    },

    // Subscription & Free Trial
    subscription: {
      plan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
      planName: { type: String, default: 'Free' },
      status: {
        type: String,
        enum: ['free', 'trial', 'active', 'past_due', 'canceled', 'expired'],
        default: 'free',
      },
      isTrial: { type: Boolean, default: false },
      trialEndsAt: { type: Date },
      periodStart: { type: Date, default: Date.now },
      periodEnd: { type: Date },
      autoRenew: { type: Boolean, default: false },
    },

    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
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

userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationOtp;
  delete obj.verificationOtpExpires;
  delete obj.verificationToken;
  delete obj.verificationTokenExpires;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

userSchema.statics.computeYearsOfExperience = function computeYears(expList = []) {
  let totalYears = 0;
  expList.forEach((exp) => {
    if (!exp.startDate) return;
    const end = exp.current ? new Date() : exp.endDate || new Date();
    const years = (end - new Date(exp.startDate)) / (365.25 * 24 * 60 * 60 * 1000);
    if (years > 0) totalYears += years;
  });
  return Math.min(Math.round(totalYears), 50);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
