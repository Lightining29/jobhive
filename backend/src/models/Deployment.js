const mongoose = require('mongoose');

const deploymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    version: { type: Number, default: 1 },
    deploymentPath: { type: String, required: true },
    status: {
      type: String,
      enum: ['building', 'live', 'failed', 'offline'],
      default: 'building',
    },
    live:  { type: Boolean, default: false },
    theme: { type: String, default: 'dark-orange' }, // portfolio colour theme
    html:  { type: String, select: false },
    meta: {
      title:       String,
      description: String,
      name:        String,
    },
    analytics: {
      views:      { type: Number, default: 0 },
      lastViewed: Date,
    },
    settings: {
      passwordHash:    String,
      passwordEnabled: { type: Boolean, default: false },
      expiresAt:       Date,
      indexable:       { type: Boolean, default: true },
    },
    history: [
      {
        version:    Number,
        deployedAt: Date,
        path:       String,
      },
    ],
  },
  { timestamps: true }
);

deploymentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Deployment', deploymentSchema);
