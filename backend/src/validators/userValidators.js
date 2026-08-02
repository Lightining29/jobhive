const Joi = require('joi');

const socialLinksSchema = Joi.object({
  linkedin: Joi.string().uri().allow('').optional(),
  github: Joi.string().uri().allow('').optional(),
  portfolio: Joi.string().uri().allow('').optional(),
});

const educationSchema = Joi.object({
  institution: Joi.string().trim().max(120).required(),
  degree: Joi.string().trim().max(120).required(),
  fieldOfStudy: Joi.string().trim().max(120).allow('').optional(),
  startYear: Joi.number().integer().min(1950).max(2100).optional(),
  endYear: Joi.number().integer().min(1950).max(2100).allow(null).optional(),
});

const experienceSchema = Joi.object({
  role: Joi.string().trim().max(120).required(),
  company: Joi.string().trim().max(120).required(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().allow(null).optional(),
  current: Joi.boolean().default(false),
  description: Joi.string().trim().max(1000).allow('').optional(),
});

const certificationSchema = Joi.object({
  name: Joi.string().trim().max(120).required(),
  issuer: Joi.string().trim().max(120).allow('').optional(),
  year: Joi.number().integer().min(1950).max(2100).optional(),
  link: Joi.string().uri().allow('').optional(),
});

const preferencesSchema = Joi.object({
  preferredLocations: Joi.array().items(Joi.string().trim().max(80)).optional(),
  preferredSalary: Joi.number().min(0).allow(null).optional(),
  preferredSalaryCurrency: Joi.string().trim().max(10).optional(),
  preferredWorkMode: Joi.string().valid('remote', 'hybrid', 'onsite', '').optional(),
  preferredEmploymentType: Joi.string()
    .valid('full-time', 'part-time', 'contract', 'internship', '')
    .optional(),
  preferredCategory: Joi.string().valid('technical', 'non-technical', '').optional(),
  preferredJobTitle: Joi.string().trim().max(100).allow('').optional(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).optional(),
  phone: Joi.string().trim().max(20).allow('').optional(),
  headline: Joi.string().trim().max(160).allow('').optional(),
  bio: Joi.string().trim().max(1000).allow('').optional(),
  skills: Joi.array().items(Joi.string().trim().min(1).max(50)).optional(),
  education: Joi.array().items(educationSchema).optional(),
  experience: Joi.array().items(experienceSchema).optional(),
  certifications: Joi.array().items(certificationSchema).optional(),
  socialLinks: socialLinksSchema.optional(),
  preferences: preferencesSchema.optional(),
}).min(1);

module.exports = { updateProfileSchema };
