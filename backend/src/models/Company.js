const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: 120,
      index: true,
    },
    slug: { type: String, trim: true, lowercase: true, index: true },
    website: { type: String, trim: true },
    logo: {
      url: { type: String, default: '' },
      publicId: { type: String },
    },
    description: { type: String, trim: true, maxlength: 3000 },
    industry: { type: String, trim: true },
    size: { type: String, trim: true },
    foundedYear: Number,
    headquarters: { type: String, trim: true },
    country: { type: String, trim: true },
    city: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    socialLinks: {
      linkedin: String,
      twitter: String,
      facebook: String,
    },
    verified: { type: Boolean, default: false },
    verifiedAt: Date,
    documents: [{ name: String, url: String }],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

companySchema.index({ name: 'text', industry: 'text' });

const Company = mongoose.model('Company', companySchema);
module.exports = Company;
