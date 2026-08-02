const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true, index: true, unique: true },
    source: {
      type: String,
      enum: ['recruiter', 'jooble', 'adzuna', 'arbeitnow', 'remotive', 'muse', 'himalayas', 'jobicy', 'greenhouse', 'amazon', 'ashby', 'internshala'],
      required: true,
      index: true,
    },

    companyName: { type: String, required: true, trim: true, index: true },
    companyLogo: { type: String, default: '' },
    companyWebsite: { type: String, default: '' },

    jobTitle: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '' },

    requiredSkills: [{ type: String, trim: true, lowercase: true }],
    category: {
      type: String,
      enum: ['technical', 'non-technical'],
      index: true,
    },
    subCategory: { type: String, trim: true, index: true },

    experience: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    experienceLevel: {
      type: String,
      enum: ['internship', 'fresher', 'junior', 'mid', 'senior', 'lead', ''],
      default: '',
    },

    salary: { type: Number, default: 0 },
    salaryMin: { type: Number, default: 0 },
    salaryMax: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    salaryPeriod: { type: String, enum: ['yearly', 'monthly', 'hourly', ''], default: 'yearly' },

    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'temporary', ''],
      default: 'full-time',
      index: true,
    },

    location: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, index: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true, index: true },

    workMode: {
      type: String,
      enum: ['remote', 'hybrid', 'onsite', ''],
      default: '',
      index: true,
    },
    remote: { type: Boolean, default: false },
    hybrid: { type: Boolean, default: false },
    onsite: { type: Boolean, default: false },

    industry: { type: String, trim: true, index: true },
    postedDate: { type: Date, default: Date.now, index: true },
    expiresAt: { type: Date },

    applicationUrl: { type: String, default: '' },
    applicationEmail: { type: String, default: '' },

    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },

    isActive: { type: Boolean, default: true, index: true },
    isVerified: { type: Boolean, default: true },
    isExpired: { type: Boolean, default: false },
    trendingScore: { type: Number, default: 0 },

    raw: { type: mongoose.Schema.Types.Mixed, select: false },
  },
  { timestamps: true }
);

jobSchema.index({ jobTitle: 'text', description: 'text', requiredSkills: 'text', companyName: 'text' });
jobSchema.index({ isActive: 1, isExpired: 1, postedDate: -1 });
jobSchema.index({ category: 1, workMode: 1, employmentType: 1 });
jobSchema.index({ salaryMax: -1 });
jobSchema.index({ expiresAt: 1 });

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
