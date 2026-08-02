const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['job', 'company', 'user'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    details: { type: String, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ['open', 'resolved', 'dismissed'],
      default: 'open',
      index: true,
    },
    resolution: { type: String, trim: true, maxlength: 1000 },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
