const mongoose = require('mongoose');

const jobLogSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      index: true,
    },
    type: { type: String, enum: ['fetch', 'failure', 'update', 'expire', 'rate-limit'], index: true },
    message: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

jobLogSchema.index({ createdAt: -1 });

const JobLog = mongoose.model('JobLog', jobLogSchema);
module.exports = JobLog;
