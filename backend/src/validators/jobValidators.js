const Joi = require('joi');

const jobCreateSchema = Joi.object({
  jobTitle: Joi.string().trim().min(2).max(150).required(),
  description: Joi.string().trim().min(30).max(30000).required(),
  requiredSkills: Joi.array().items(Joi.string().trim().min(1).max(60)).default([]),
  category: Joi.string().valid('technical', 'non-technical').optional(),
  subCategory: Joi.string().trim().max(100).allow('').optional(),
  experienceMin: Joi.number().integer().min(0).max(50).allow(null).default(0),
  experienceMax: Joi.number().integer().min(0).max(50).allow(null).default(0),
  experienceLevel: Joi.string()
    .valid('internship', 'fresher', 'junior', 'mid', 'senior', 'lead', '')
    .allow('')
    .optional(),
  salaryMin: Joi.number().min(0).allow(null).default(0),
  salaryMax: Joi.number().min(0).allow(null).default(0),
  currency: Joi.string().trim().max(10).default('USD'),
  salaryPeriod: Joi.string().valid('yearly', 'monthly', 'hourly', '').allow('').default('yearly'),
  employmentType: Joi.string()
    .valid('full-time', 'part-time', 'contract', 'internship', 'temporary', '')
    .default('full-time'),
  location: Joi.string().trim().max(200).required(),
  city: Joi.string().trim().max(100).allow('').optional(),
  state: Joi.string().trim().max(100).allow('').optional(),
  country: Joi.string().trim().max(100).allow('').optional(),
  workMode: Joi.string().valid('remote', 'hybrid', 'onsite', '').allow('').optional(),
  industry: Joi.string().trim().max(100).allow('').optional(),
  applicationUrl: Joi.string().uri().allow('').optional(),
  applicationEmail: Joi.string().email().allow('').optional(),
  expiresInDays: Joi.number().integer().min(1).max(180).default(30),
});

const jobUpdateSchema = jobCreateSchema.fork(['jobTitle', 'description', 'location'], (s) =>
  s.optional()
).min(1);

const applyJobSchema = Joi.object({
  coverLetter: Joi.string().trim().max(4000).allow('').optional(),
});

const reportSchema = Joi.object({
  targetId: Joi.string().optional(),
  reason: Joi.string().trim().min(3).max(300).required(),
  details: Joi.string().trim().max(1000).allow('').optional(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'shortlisted', 'interview', 'rejected', 'accepted')
    .required(),
});

const scheduleInterviewSchema = Joi.object({
  date: Joi.date().iso().min('now').required(),
  mode: Joi.string().valid('video', 'phone', 'onsite').required(),
  link: Joi.string().uri().allow('').optional(),
  notes: Joi.string().trim().max(1000).allow('').optional(),
});

module.exports = {
  jobCreateSchema,
  jobUpdateSchema,
  applyJobSchema,
  reportSchema,
  updateStatusSchema,
  scheduleInterviewSchema,
};
