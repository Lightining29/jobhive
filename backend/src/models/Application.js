const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeUrl: { type: String, default: '' },
    coverLetter: { type: String, trim: true, maxlength: 4000 },

    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'interview', 'rejected', 'accepted', 'withdrawn'],
      default: 'pending',
      index: true,
    },

    interview: {
      scheduled: { type: Boolean, default: false },
      date: Date,
      mode: { type: String, enum: ['video', 'phone', 'onsite', ''], default: '' },
      link: { type: String },
      notes: { type: String },
    },

    notes: { type: String },
    appliedSource: { type: String, enum: ['portal', 'external'], default: 'portal' },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
applicationSchema.index({ candidate: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
