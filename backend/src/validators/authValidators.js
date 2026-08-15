const Joi = require('joi');

const email = Joi.string().email().required().lowercase();
const password = Joi.string().min(8).max(72).required();

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email,
  password,
  role: Joi.string().valid('candidate', 'recruiter').default('candidate'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().lowercase(),
  password: Joi.string().min(1).required(),
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required().lowercase(),
  otp: Joi.string().trim().length(6).required(),
});

const resendOtpSchema = Joi.object({
  email: Joi.string().email().required().lowercase(),
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().optional(),
  email: Joi.string().email().optional().lowercase(),
  otp: Joi.string().trim().length(6).optional(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().lowercase(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).max(72).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
