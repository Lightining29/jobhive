const Joi = require('joi');

const adminActionSchema = Joi.object({
  status: Joi.string().valid('active', 'suspended').optional(),
  verified: Joi.boolean().optional(),
  isVerified: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  isExpired: Joi.boolean().optional(),
  trendingScore: Joi.number().optional(),
  action: Joi.string().optional(),
}).unknown(true);

const resolveReportSchema = Joi.object({
  action: Joi.string().valid('resolved', 'dismissed').required(),
  resolution: Joi.string().trim().max(1000).allow('').optional(),
});

module.exports = { adminActionSchema, resolveReportSchema };
