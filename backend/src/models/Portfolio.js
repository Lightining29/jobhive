const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    theme: {
      type: String,
      enum: ['modern_tech', 'executive'],
      default: 'modern_tech',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    themeSettings: {
      accentColor: { type: String, default: '#00f0ff' },
      font: { type: String, default: 'Plus Jakarta Sans' },
      layout: { type: String, default: 'standard' },
    },
    hero: {
      name: { type: String, default: '' },
      title: { type: String, default: '' },
      tagline: { type: String, default: '' },
      bioShort: { type: String, default: '' },
      avatar: { type: String, default: '' },
      ctaHire: { type: String, default: 'Hire Me' },
      ctaWork: { type: String, default: 'View My Work' },
      showResume: { type: Boolean, default: true },
      resumeUrl: { type: String, default: '' },
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      phonePublic: { type: Boolean, default: false },
      location: { type: String, default: '' },
    },
    about: {
      summary: { type: String, default: '' },
      highlights: [{ type: String }],
      experienceYears: { type: Number, default: 0 },
      openToRoles: [{ type: String }],
    },
    skills: {
      categories: [
        {
          name: { type: String },
          skills: [{ type: String }],
        },
      ],
    },
    experience: [
      {
        role: { type: String },
        company: { type: String },
        duration: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        current: { type: Boolean, default: false },
        location: { type: String },
        description: { type: String },
        bullets: [{ type: String }],
        technologies: [{ type: String }],
      },
    ],
    projects: [
      {
        title: { type: String },
        description: { type: String },
        problem: { type: String },
        solution: { type: String },
        features: [{ type: String }],
        technologies: [{ type: String }],
        githubUrl: { type: String },
        liveUrl: { type: String },
        imageUrl: { type: String },
      },
    ],
    education: [
      {
        degree: { type: String },
        institution: { type: String },
        fieldOfStudy: { type: String },
        startYear: { type: Number },
        endYear: { type: Number },
        grade: { type: String },
      },
    ],
    certifications: [
      {
        name: { type: String },
        issuer: { type: String },
        year: { type: Number },
        credentialId: { type: String },
        verificationUrl: { type: String },
      },
    ],
    achievements: [
      {
        title: { type: String },
        description: { type: String },
        issuer: { type: String },
        year: { type: Number },
      },
    ],
    services: [
      {
        title: { type: String },
        description: { type: String },
        icon: { type: String, default: 'code' },
      },
    ],
    seo: {
      title: { type: String },
      metaDescription: { type: String },
      keywords: [{ type: String }],
    },
  },
  { timestamps: true }
);

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
module.exports = Portfolio;
