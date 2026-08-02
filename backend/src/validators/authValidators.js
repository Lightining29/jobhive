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

const verifyEmailSchema = Joi.object({
  token: Joi.string().required(),
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
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
