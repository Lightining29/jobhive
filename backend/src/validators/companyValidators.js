const Joi = require('joi');

const companyRegisterSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  website: Joi.string().uri().allow('').optional(),
  description: Joi.string().trim().max(3000).allow('').optional(),
  industry: Joi.string().trim().max(100).allow('').optional(),
  size: Joi.string().trim().max(40).allow('').optional(),
  foundedYear: Joi.number().integer().min(1600).max(2100).allow(null).optional(),
  headquarters: Joi.string().trim().max(120).allow('').optional(),
  country: Joi.string().trim().max(80).allow('').optional(),
  city: Joi.string().trim().max(80).allow('').optional(),
  email: Joi.string().email().allow('').optional(),
  phone: Joi.string().trim().max(20).allow('').optional(),
  socialLinks: Joi.object({
    linkedin: Joi.string().uri().allow('').optional(),
    twitter: Joi.string().uri().allow('').optional(),
    facebook: Joi.string().uri().allow('').optional(),
  }).optional(),
});

const updateCompanySchema = companyRegisterSchema.keys({}).min(1);

module.exports = { companyRegisterSchema, updateCompanySchema };
